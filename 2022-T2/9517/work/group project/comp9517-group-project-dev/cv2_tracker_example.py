# pip install opencv-python
# pip install opencv-contrib-python

import cv2
import sys
import matplotlib.pyplot as plt

(major_ver, minor_ver, subminor_ver) = (cv2.__version__).split('.')
print(f"cv2.__version__: {cv2.__version__}")

if __name__ == '__main__':

    # Set up tracker.
    # Instead of CSRT, you can also use

    tracker_types = ['BOOSTING', 'MIL', 'KCF', 'TLD', 'MEDIANFLOW', 'CSRT', 'MOSSE', 'GOTURN']
    tracker_type = tracker_types[6]

    tracker = cv2.TrackerKCF_create()

    root_dir = "datasets/step_images"
    frame = cv2.imread(f"{root_dir}/train/STEP-ICCV21-02/000001.jpg")

    bbox = cv2.selectROI(frame)
    print(f"bbox:{bbox}")
    ok = tracker.init(frame, bbox)
    for i in range(2, 1000):
        file = f"{root_dir}/train/STEP-ICCV21-02/{i:06}.jpg"
        print(file)
        frame = cv2.imread(file)
        ok, bbox = tracker.update(frame)
        if ok:
            (x, y, w, h) = [int(v) for v in bbox]
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2, 1)
        else:
            cv2.putText(frame, 'Error', (100, 0), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        cv2.imshow('Tracking', frame)
        if cv2.waitKey(1) & 0XFF == 27:
            break
    cv2.destroyAllWindows()
