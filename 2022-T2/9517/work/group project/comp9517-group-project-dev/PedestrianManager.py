import math
import numpy as np


def distance(c1, c2):
    return math.sqrt((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2)


def revise_w(w, h):
    if w / h > 0.5:  # revise with for sitting people
        w = w * 0.8
    else:
        w = h * 0.385
    return w


def revise_h(w, h):
    return h


def get_meter_ratio(box):
    x11, y11, x12, y12, = box
    w1 = x12 - x11
    h1 = y12 - y11
    ratio = 3 / ((revise_w(w1, h1) + revise_h(w1, h1)))  #
    return ratio


def center_distance(box1, box2):
    c1 = get_center(box1)
    c2 = get_center(box2)
    return distance(c1, c2)


def center_distance_real(box1, box2):
    r1 = get_meter_ratio(box1)
    r2 = get_meter_ratio(box2)
    r = (r1 + r2) / 2
    return r * center_distance(box1, box2)


def is_move_to_center(p0, p1, image_h, image_w):
    img_center = (image_w // 2, image_h // 2)
    if distance(p0, img_center) > distance(p1, img_center):
        return True
    return False


def border_distance(box, image_h, image_w):
    x1, y1, x2, y2 = box
    r = get_meter_ratio(box)
    return min([r * x1, r * y1, r * (image_w - x2), r * (image_h - y2)])


def near_border(box, border_threshold, image_h, image_w):
    r = get_meter_ratio(box)
    x1, y1, x2, y2 = box
    if (r * x1) < border_threshold:  # left
        return 1
    if (r * y1) < border_threshold:  # top
        return 2
    if (r * (image_w - x2)) < border_threshold:  # right
        return 3
    if (r * (image_h - y2)) < border_threshold:  # bottom
        return 4
    return 0


def get_center(box):
    return (math.ceil((box[0] + box[2]) / 2), math.ceil((box[1] + box[3]) / 2))


def check_highlight(pedestrianInfo, highlight_count, border_threshold, image_h, image_w, id):
    trajectory = pedestrianInfo.trajectory
    if len(trajectory) <= 1:
        return
    if not near_border(trajectory[0], border_threshold, image_h, image_w):
        return
    if pedestrianInfo.frame_counter > 15:  # appear more than 5 frames
        return
    if pedestrianInfo.highlight_counter > 0:
        return

    check_count = 4
    # for rush
    if len(trajectory) < check_count and center_distance_real(trajectory[0], trajectory[-1]) > 2:
        pedestrianInfo.highlight_counter = highlight_count
        return

    if len(trajectory) != check_count:
        return
    to_center_count = 0
    for i in range(check_count - 1):
        if is_move_to_center(get_center(trajectory[i]), get_center(trajectory[i + 1])
                , image_h, image_w):
            to_center_count += 1
    # if id ==59:
    #     print(f"center_distance_real:{center_distance_real(trajectory[0], trajectory[-1])}")
    # print(f"check_highlight, to_center_count={to_center_count}")
    if to_center_count >= (check_count - 1) and center_distance_real(trajectory[0], trajectory[-1]) > 0.3:
        pedestrianInfo.highlight_counter = highlight_count


s_h = 1.8 * 1000
s_w = s_h * 0.385
r_w_h = s_w / s_h
h_w_standard = s_h + s_w


def get_w(box):
    x1, y1, x2, y2, = box
    return x2 - x1


def is_in_same_group(box1, box2, log=False):
    # print(f"box1:{box1}, box2:{box2}")
    x11, y11, x12, y12, = box1
    x21, y21, x22, y22, = box2
    cx1 = (x12 + x11) / 2
    cx2 = (x22 + x21) / 2

    w1 = x12 - x11
    w2 = x22 - x21
    h1 = y12 - y11
    h2 = y22 - y21

    # w_d1 = s_w / w1
    # w_d2 = s_w / w2
    # d_by_w = abs(w_d2 - w_d1)
    if log:
        print(f"w1/h1:{w1 / h1}")
        print(f"w2/h2:{w2 / h2}")
    # a1 = math.sqrt(revise_w(w1, h1) ** 2 + revise_h(w1, h1) ** 2)
    # a2 = math.sqrt(revise_w(w2, h2) ** 2 + revise_h(w2, h2) ** 2)
    ratio1 = (revise_w(w1, h1) + revise_h(w1, h1)) * 0.8  #
    ratio2 = (revise_w(w2, h2) + revise_h(w2, h2)) * 0.8
    a_d1 = h_w_standard / ratio1  # estimate the distance to the camera
    a_d2 = h_w_standard / ratio2
    if log:
        print(f"a_d1:{a_d1:.1f}, a_d2:{a_d2:.1f}")
    d_by_a = abs(a_d2 - a_d1)
    # print(f"d_by_a:{d_by_a}")
    if log:
        print(f"d:{d_by_a:.1f}")
    if d_by_a > 2.6:
        return False

    # ratio = d_to_c / ((w_d1 + w_d2) / 2)
    ratio = np.mean([ratio1, ratio2])

    # print(f"d by w:{d_by_w:.1f}")
    # width

    # w_avg = (w1 + w2) / 2
    w_min = min([w1, w2])

    # horizontal distance
    h_d = abs(cx2 - cx1)
    if log:
        print(f"h_d:{h_d}, w_min:{w_min}, w1:{w1}, w2:{w2}")
    if h_d > (w_min * 1.8):
        return False
    h_d_r = h_d * 2 / ratio
    d = math.sqrt(d_by_a ** 2 + h_d_r ** 2)
    if log:
        print(f"h_d_r:{h_d_r}, d:{d}")
    if d > 2.:
        return False

    h_max = max([h1, h2])
    # bottom distance
    b_d = abs(y22 - y12)
    if b_d > (h_max * 0.20):
        if log:
            print(f"b_d > (h_max * 0.15). b_d:{b_d}, h_max:{h_max}")
        return False

    return True


def is_pedestrian_in_same_group(p1, p2):
    if len(p1.s_boxes) < 2 or len(p2.s_boxes) < 2:
        return False
    if is_in_same_group(p1.s_boxes[-1], p2.s_boxes[-1]) \
            and is_in_same_group(p1.s_boxes[-2], p2.s_boxes[-2]):
        return True
    return False


def check_group(pedestrianManager):
    pedestrianInfos = pedestrianManager.getPedestrianInfos()
    pedestrianInfoArr = []
    for id, pedestrianInfo in pedestrianInfos.items():
        pedestrianInfoArr.append(pedestrianInfo)
    n = len(pedestrianInfoArr)
    id_group_map = {}
    group_id_counter = 0
    for i in range(n):
        p1 = pedestrianInfoArr[i]
        for j in range(i + 1, n):
            p2 = pedestrianInfoArr[j]
            if (is_pedestrian_in_same_group(p1, p2)):
                id1, id2 = p1.id, p2.id
                if id1 in id_group_map and id2 in id_group_map:
                    # merge group
                    gid1 = id_group_map[id1]
                    gid2 = id_group_map[id2]
                    for pid, gid in id_group_map.items():
                        if gid == gid2:
                            id_group_map[pid] = gid1
                    id_group_map[id2] = gid1
                elif id1 in id_group_map:
                    id_group_map[id1] = id_group_map[id1]
                elif id2 in id_group_map:
                    id_group_map[id1] = id_group_map[id2]
                else:
                    id_group_map[id1] = group_id_counter
                    id_group_map[id2] = group_id_counter
                    group_id_counter += 1
    # print(f"id_group_map:{id_group_map}")
    groups = {}
    for id, gid in id_group_map.items():
        if gid not in groups:
            groups[gid] = []
        groups[gid].append(id)
    return groups


class PedestrianInfo:
    def __init__(self):
        self.id = None
        self.last_detected = 0
        self.boxes = []  # keep last n boxes
        self.s_boxes = []  # stable boxes, average the size of the box by last 3 boxes
        self.trajectory = []  # only keep some key boxes
        self.frame_counter = 0
        self.highlight_counter = 0
        self.last_moving_frame = -1

    def highlight(self):
        if self.highlight_counter == 0:
            return False
        return True


def calculate_avg_box(boxes):
    box = boxes[-1]
    n = len(boxes)
    if n == 1:
        return box
    x1, y1, x2, y2 = box
    center = ((x1 + x2) / 2, (y1 + y2) / 2)
    n = min(n, 15)
    w = 0
    h = 0
    for i in range(n):
        index = -1 - i
        box = boxes[index]
        x1, y1, x2, y2 = box
        w = w + (x2 - x1)
        h = h + (y2 - y1)
    avg_hw = w / (2 * n)
    avg_hh = h / (2 * n)
    x1, y1, x2, y2 = int(center[0] - avg_hw), int(center[1] - avg_hh) \
        , int(center[0] + avg_hw), int(center[1] + avg_hh)
    return (x1, y1, x2, y2)


def is_moving(pedestrianInfo, fid):
    if pedestrianInfo.last_moving_frame < 0:
        return False
    if (fid - pedestrianInfo.last_moving_frame) <= 10:
        return True
    return False


class PedestrianManager:

    def __init__(self):
        self.all_pedestrian_ids = set()
        self.pedestrian_map = {}
        # self.trajectory_every = 3
        self.highlight_count = 24  # highlight for * frames
        self.remove_threshold = 2  # check removing pedestrian if they are not detected for n frames
        self.groups = None
        self.keep_n_boxes = 20
        self.region_box = [None, None, None, None]

    def set_image_size(self, image_size):
        self.image_h = image_size[0]
        self.image_w = image_size[1]
        self.border_threshold = 5  # 5m
        print(f"border_threshold: {self.border_threshold}")

    def getPedestrianInfos(self):
        return self.pedestrian_map

    # Report the total count of all unique pedestrians detected since the start of the video.
    def get_total_number_of_pedestrians(self):
        return len(self.all_pedestrian_ids)

    def update(self, boxes, fid):
        current_ids = []
        # box1 = None
        # box2 = None
        for box_info in boxes:
            x1, y1, x2, y2, cls_name, id = box_info

            box = (x1, y1, x2, y2)

            self.all_pedestrian_ids.add(id)
            current_ids.append(id)
            # all_pedestrians.
            if id not in self.pedestrian_map:
                # new pedestrian
                pedestrianInfo = PedestrianInfo()
                pedestrianInfo.id = id
                self.pedestrian_map[id] = pedestrianInfo
            else:
                pedestrianInfo = self.pedestrian_map[id]
                if pedestrianInfo.highlight_counter > 0:
                    pedestrianInfo.highlight_counter -= 1

            pedestrianInfo.frame_counter += 1
            pedestrianInfo.last_detected = 0

            pedestrianInfo.boxes.append(box)
            s_box = calculate_avg_box(pedestrianInfo.boxes)
            pedestrianInfo.s_boxes.append(s_box)
            if len(pedestrianInfo.boxes) > self.keep_n_boxes:
                pedestrianInfo.boxes.pop(0)
                pedestrianInfo.s_boxes.pop(0)

            # if (fid + 1) % self.trajectory_every == 0:
            if len(pedestrianInfo.trajectory) == 0:
                pedestrianInfo.trajectory.append(s_box)
            else:
                last_box = pedestrianInfo.trajectory[-1]
                c_d = center_distance_real(last_box, s_box)
                # if id == 15:
                #     print(f"id:{id},c_d:{c_d}")
                if c_d > 0.1:
                    pedestrianInfo.trajectory.append(box)
                    pedestrianInfo.last_moving_frame = fid
                    # if id == 15:
                    #     print(f"15 fid:{fid}")
            # pedestrianInfo.trajectory.append((int((x1 + x2) / 2), y2))
            if fid > 20:
                check_highlight(pedestrianInfo, self.highlight_count, self.border_threshold
                                , self.image_h, self.image_w, id)

        ids2delete = []
        # print(f"target_detector.faceTracker:{target_detector.faceTracker}")
        for history_id in self.pedestrian_map:
            pedestrianInfo = self.pedestrian_map[history_id]
            if not history_id in current_ids:
                pedestrianInfo.last_detected -= 1
            if pedestrianInfo.last_detected > -self.remove_threshold:
                continue
            trajectory = pedestrianInfo.trajectory
            if pedestrianInfo.last_detected < -(self.remove_threshold * 8):
                ids2delete.append(history_id)
            if pedestrianInfo.last_detected < -self.remove_threshold and is_moving(pedestrianInfo, fid) \
                    and border_distance(pedestrianInfo.s_boxes[-1], self.image_h, self.image_w) < 1 \
                    and center_distance_real(trajectory[0], trajectory[-1]) > 1.5:
                ids2delete.append(history_id)

        for id in ids2delete:
            self.pedestrian_map.pop(id)

        # id1, id2 = 1, 3
        # if id1 in self.pedestrian_map and id2 in self.pedestrian_map:
        #     print("is_in_same_group:", is_in_same_group(self.pedestrian_map[id1].s_boxes[-1]
        #                                                 , self.pedestrian_map[id2].s_boxes[-1]
        #                                                 , log=True))

        self.groups = check_group(self)

    def has_region_box(self):
        return self.region_box[0] and self.region_box[1] and self.region_box[2] and \
               self.region_box[3]

    INSTANCE = None

    @staticmethod
    def instance():
        if not PedestrianManager.INSTANCE:
            PedestrianManager.INSTANCE = PedestrianManager()
        return PedestrianManager.INSTANCE
