import cv2
import numpy as np

palette = (2 ** 11 - 1, 2 ** 15 - 1, 2 ** 20 - 1)


def compute_color_for_labels(label):
    """
    Simple function that adds fixed color depending on the class
    """
    color = [int((p * (label ** 2 - label + 1)) % 255) for p in palette]
    return tuple(color)


def get_total_number_of_pedestrians_in_region(x1, y1, x2, y2, region_box):
    x_down, y_down, x_up, y_up = region_box
    x_center = (x1 + x2) / 2
    y_center = (y1 + y2) / 2
    if min(x_down, x_up) < x_center < max(x_down, x_up):
        if min(y_down, y_up) < y_center < max(y_down, y_up):
            return True
    return False


def draw(img, pedestrianManager, fid):
    show_id = False

    pedestrianInfos = pedestrianManager.getPedestrianInfos()
    if pedestrianManager.has_region_box():
        x_down, y_down, x_up, y_up = pedestrianManager.region_box
        cv2.rectangle(img, (x_down, y_down), (x_up, y_up), [0, 255, 0], 6)
    count_in_region = 0
    region = False
    for id, pedestrianInfo in pedestrianInfos.items():
        box = pedestrianInfo.s_boxes[-1]
        x1, y1, x2, y2 = box
        if pedestrianManager.has_region_box():
            region = True
            if get_total_number_of_pedestrians_in_region(x1, y1, x2, y2, pedestrianManager.region_box) == False:
                continue
            count_in_region += 1
        # box text and bar
        color = compute_color_for_labels(id)
        # label = '%d %s %d' % (id, cls_names[i], scores[i])
        label = f'{id}'
        # label += '%'
        thickness = 2
        show_rectangle = True
        if pedestrianInfo.highlight():
            thickness = 4
            # show_rectangle = fid % 4 == 0  # flashing
            if show_rectangle:
                text = "new"
                t_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_PLAIN, 1.5, 1)[0]
                cv2.rectangle(img, (x1, y1), (x1 + t_size[0] + 2, y1 + t_size[1] + 4), color, -1)
                cv2.putText(img, text, (x1, y1 + t_size[1] + 1), cv2.FONT_HERSHEY_PLAIN, 1.5, [255, 255, 255], 1)

        if show_rectangle:
            cv2.rectangle(img, (x1, y1), (x2, y2), color, thickness)
            # cv2.rectangle(img, (x1, y1), (x2, int(y2 - (y2 - y1) * 0.01)), color, thickness)
            if show_id:
                t_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_PLAIN, 1.5, 1)[0]
                cv2.rectangle(img, (x1, y1), (x1 + t_size[0] + 2, y1 + t_size[1] + 2), color, -1)
                cv2.putText(img, label, (x1, y1 + t_size[1] + 2), cv2.FONT_HERSHEY_PLAIN, 1.5, [255, 255, 255], 1)
        # print(f"track:{track}")
        if pedestrianInfo.trajectory:
            line = []
            for p in pedestrianInfo.trajectory:
                x1, y1, x2, y2 = p
                line.append((int((x1 + x2) / 2), y2))
            cv2.polylines(img, [np.array(line)], isClosed=False, color=color, thickness=2)

    n_p_total = pedestrianManager.get_total_number_of_pedestrians()
    n_p = len(pedestrianInfos)
    info = f"number of pedestrians:{n_p}/{n_p_total}. "

    groups = pedestrianManager.groups
    n_p_in_group = 0
    for gid, pids in groups.items():
        n_p_in_group += len(pids)
    n_p_not_in_group = n_p - n_p_in_group
    info += f"In group:{n_p_in_group}, alone:{n_p_not_in_group}. "

    if region:
        info += f"In the region:{count_in_region}. "

    cv2.putText(img, info, (20, img.shape[0] - 20), cv2.FONT_HERSHEY_PLAIN, 2, [200, 200, 200], 2)
    draw_group(img, pedestrianManager, fid)


def draw_group(img, pedestrianManager, fid):
    groups = pedestrianManager.groups
    if not groups:
        return
    pedestrianInfos = pedestrianManager.getPedestrianInfos()
    for gid, pids in groups.items():
        g_x1, g_y1, g_x2, g_y2 = pedestrianManager.image_w + 1, pedestrianManager.image_h + 1, -1, -1
        for pid in pids:
            pedestrianInfo = pedestrianInfos[pid]
            x1, y1, x2, y2 = pedestrianInfo.s_boxes[-1]
            if x1 < g_x1:
                g_x1 = x1
            if y1 < g_y1:
                g_y1 = y1
            if x2 > g_x2:
                g_x2 = x2
            if y2 > g_y2:
                g_y2 = y2
        b = 3
        g_x1 = g_x1 - b
        g_y1 = g_y1 - b
        g_x2 = g_x2 + b
        g_y2 = g_y2 + b
        cv2.rectangle(img, (g_x1, g_y1), (g_x2, g_y2), [180, 180, 180], 1)


def draw_boxes(img, boxes):
    for box in boxes:
        x1, y1, x2, y2 = box
        cv2.rectangle(img, (x1, y1), (x2, y2), [0, 255, 0], 2)
