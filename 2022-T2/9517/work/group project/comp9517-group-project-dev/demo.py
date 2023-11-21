# Group Project

import sys

sys.path.append('yolov5')

import argparse
import os

os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"

import sys
from pathlib import Path
import torch

import Render
from PedestrianManager import PedestrianManager
from deep_sort.deep_sort import DeepSort
from utils.augmentations import letterbox
import numpy as np

FILE = Path(__file__).resolve()
# ROOT = FILE.parents[0]  # YOLOv5 root directory
ROOT = "yolov5"
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))  # add ROOT to PATH
ROOT = Path(os.path.relpath(ROOT, Path.cwd()))  # relative

from models.common import DetectMultiBackend
from utils.general import (check_img_size, cv2, non_max_suppression, print_args, scale_coords)
from utils.torch_utils import select_device, time_sync


def create_deepsort(opt):
    deepsort = DeepSort(opt.deepsort_REID_CKPT
                        , max_dist=opt.deepsort_MAX_DIST
                        , min_confidence=opt.deepsort_MIN_CONFIDENCE
                        , nms_max_overlap=opt.deepsort_NMS_MAX_OVERLAP
                        , max_iou_distance=opt.deepsort_MAX_IOU_DISTANCE
                        , max_age=opt.deepsort_MAX_AGE
                        , n_init=opt.deepsort_N_INIT
                        , nn_budget=opt.deepsort_NN_BUDGET,
                        use_cuda=True)
    return deepsort


def preprocess(img, img_size, device, stride):
    img0 = img.copy()
    # print(f"img_size:{img_size}")
    img = letterbox(img, new_shape=img_size, stride=stride)[0]
    img = img[:, :, ::-1].transpose(2, 0, 1)
    img = np.ascontiguousarray(img)
    img = torch.from_numpy(img).to(device)
    img = img.float()
    img /= 255.0
    if img.ndimension() == 3:
        img = img.unsqueeze(0)

    return img0, img


@torch.no_grad()
def detect(im, model, conf_thres, img_size, device):
    # print(f"model() img_size:{img_size}")
    im0, img = preprocess(im, img_size, device, model.stride)
    # print(f"model() im.size:{im.shape}")
    pred = model(img, augment=False, visualize=False)
    # print(f"pred.shape:{pred.shape}")
    pred = pred.float()
    pred = non_max_suppression(pred, conf_thres, 0.4)

    pred_boxes = []
    for det in pred:
        if det is not None and len(det):
            det[:, :4] = scale_coords(
                img.shape[2:], det[:, :4], im0.shape).round()

            for *x, conf, cls_id in det:
                lbl = model.names[int(cls_id)]
                if not lbl in ['person']:
                    continue
                x1, y1 = int(x[0]), int(x[1])
                x2, y2 = int(x[2]), int(x[3])
                pred_boxes.append(
                    (x1, y1, x2, y2, cls_id, conf))
    return im, pred_boxes


id_counter = {}
id_boxes = {}
id_trajectories = {}


@torch.no_grad()
def update_tracker(im, fid, model, conf_thres, img_size, yolo_only, deepsort, device, pedestrianManager):
    new_faces = []
    _, bboxes = detect(im, model, conf_thres, img_size, device)

    bbox_xywh = []
    confs = []
    clss = []
    boxes = []

    for x1, y1, x2, y2, cls_id, conf in bboxes:
        obj = [
            int((x1 + x2) / 2), int((y1 + y2) / 2),
            x2 - x1, y2 - y1
        ]
        boxes.append((x1, y1, x2, y2))
        bbox_xywh.append(obj)
        confs.append(conf)
        clss.append(cls_id)

    if yolo_only:
        Render.draw_boxes(im, boxes)
    else:
        xywhs = torch.Tensor(bbox_xywh)
        confss = torch.Tensor(confs)

        outputs = deepsort.update(xywhs, confss, clss, im)
        # print(f"len(bboxes):{len(bboxes)}, len(outputs):{len(outputs)}")

        boxes = []
        for value in outputs:
            # print(f"value.shape:{value.shape}")
            x1, y1, x2, y2, id, cls_, _, _ = value
            box = (x1, y1, x2, y2, model.names[cls_], id)
            boxes.append(box)
        pedestrianManager.update(boxes, fid)

    return im, new_faces


def detect_and_track(im, fid, model, conf_thres, img_size, yolo_only, deepsort, device, pedestrianManager):
    retDict = {
        'frame': None,
        'faces': None,
        'list_of_ids': None,
        'face_bboxes': []
    }

    update_tracker(im, fid, model, conf_thres, img_size, yolo_only, deepsort, device, pedestrianManager)


def on_mouse(event, x, y, flags, param):
    if event == cv2.EVENT_LBUTTONDOWN:
        PedestrianManager.instance().region_box[0] = x
        PedestrianManager.instance().region_box[1] = y
    elif event == cv2.EVENT_LBUTTONUP:
        PedestrianManager.instance().region_box[2] = x
        PedestrianManager.instance().region_box[3] = y


@torch.no_grad()
def run(opt):
    weights = opt.weights
    source = opt.source
    data = opt.data
    imgsz = opt.imgsz
    conf_thres = opt.conf_thres
    device = opt.device
    half = opt.half
    dnn = opt.dnn
    generate_video = opt.generate_video

    global x_down, y_down, x_up, y_up
    deepsort = create_deepsort(opt)
    x_down = 0
    y_down = 0
    x_up = 0
    y_up = 0
    # save_img = not nosave and not source.endswith('.txt')  # save inference images

    # Load model
    # if torch.backends.mps.is_available():
    #     device = "mps"
    device = select_device(device)
    print(f"Use device: {device}")
    print(f"Use data: {data}")
    yolo_model = DetectMultiBackend(weights, device=device, dnn=dnn, data=data, fp16=half)
    stride, names, pt = yolo_model.stride, yolo_model.names, yolo_model.pt
    imgsz = check_img_size(imgsz, s=stride)  # check image size
    print(f"yolo input imgsz:{imgsz}")
    # ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush']
    # print(model.names)

    # Dataloader
    # dataset = LoadImages(source, img_size=imgsz, stride=stride, auto=pt)
    bs = 1  # batch_size

    # Run inference
    yolo_model.warmup(imgsz=(1 if pt else bs, 3, *imgsz))  # warmup

    pedestrianManager = PedestrianManager.instance()

    fps = 5
    # fps = 1000
    print('fps:', fps)
    t = int(1000 / fps)
    # t = 2000
    yolo_only = False
    fid = 0  # frame id
    window_name = "demo"
    cv2.namedWindow(winname=window_name, )
    cv2.setMouseCallback(window_name, on_mouse)

    videoWriter = None
    # cv2.resizeWindow(window_name, 1080 * 5, 1920 * 5)
    # for i in range(1, 451):
    video_file = "result.mp4"
    if os.path.exists(video_file):
        os.remove(video_file)

    n_images = 450
    # n_images = 20
    for i in range(1, n_images + 1):
        # file = f"{root_dir}/train/STEP-ICCV21-02/{i:06}.jpg"
        file = f"{source}/{i:06}.jpg"

        im = cv2.imread(file)
        if fid == 0:
            image_h = im.shape[0]
            image_w = im.shape[1]
            print(f"image_size:({image_h}, {image_w})")
            pedestrianManager.set_image_size((image_h, image_w))

        if videoWriter is None:
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # opencv3.0
            videoWriter = cv2.VideoWriter(
                video_file, fourcc, fps, (image_w, image_h))

        detect_and_track(im, fid, yolo_model, conf_thres, imgsz[0], yolo_only, deepsort, device, pedestrianManager)
        im_r = im
        if fid == 100:
            pedestrianManager.region_box = [1000, 300, 1500, 800]
        if fid > 180:
            pedestrianManager.region_box = [None, None, None, None]
        Render.draw(im_r, pedestrianManager, fid)

        if generate_video:
            videoWriter.write(im_r)

        # cv2.rectangle(im_r, (10, 10), (10+int(image_w*0.1), 10+int(image_w*0.1)),  [255, 255, 255], 2)
        # im_r = imutils.resize(im_r, height=500)
        if not generate_video:
            im_r = cv2.resize(im_r, (int(1920 * 1.5), int(1080 * 1.5)))
            cv2.imshow(window_name, im_r)
            cv2.waitKey(t)

        fid += 1
        print(f"fid:{fid}")

        # if cv2.getWindowProperty(name, cv2.WND_PROP_AUTOSIZE) < 1:
        #     break
        # except Exception as e:
        #     print(e)
        #     break

    cv2.destroyAllWindows()
    videoWriter.release()
    print("Done!")


def parse_opt():
    parser = argparse.ArgumentParser()
    opt = parser.parse_args()
    return opt


def main(opt):
    print_args(vars(opt))
    run(opt)


if __name__ == "__main__":
    opt = parse_opt()
    opt.source = "datasets/step_images/test/STEP-ICCV21-01"
    # opt.source = "assets/000002.jpg"
    opt.weights = "weights/yolov5s.pt"
    opt.weights = "weights/yolov5m.pt"
    # opt.weights = "weights/best.pt"
    # opt.weights = "yolov5m/weights/best.pt"
    # opt.weights = "yolov5m/weights/last.pt"
    opt.config_deepsort = "deep_sort.yaml"
    opt.data = ROOT / 'data/coco128.yaml'  # dataset.yaml path
    opt.imgsz = (640, 640)
    opt.device = ''
    opt.half = False
    opt.dnn = False
    # opt.weights = "weights/yolov5s6.pt"
    # opt.imgsz = (1280, 1280)

    opt.conf_thres = 0.25
    opt.generate_video = False

    opt.deepsort_REID_CKPT = "deep_sort/deep_sort/deep/checkpoint/ckpt.t7"
    opt.deepsort_MAX_DIST = 0.1
    opt.deepsort_MIN_CONFIDENCE = 0.3
    opt.deepsort_NMS_MAX_OVERLAP = 0.5
    opt.deepsort_MAX_IOU_DISTANCE = 0.7
    opt.deepsort_MAX_AGE = 70
    opt.deepsort_N_INIT = 3
    opt.deepsort_NN_BUDGET = 100

    main(opt)
