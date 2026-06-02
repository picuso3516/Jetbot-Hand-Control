import cv2
from ultralytics import YOLO

model = YOLO("C:\\Users\\picus\\OneDrive\\เอกสาร\\selfdrive-P,Ohm\\best.pt")  # ← เปลี่ยนเป็น path จริงของ best.pt

CLASS_NAMES = {
    0: "forward",
    1: "backward",
    2: "left",
    3: "right",
    4: "spin"
}

cap = cv2.VideoCapture(0)  # 0 = webcam ตัวแรก

print("เปิดกล้องแล้ว กด Q เพื่อออก")

while True:
    ret, frame = cap.read()
    if not ret:
        print("เปิดกล้องไม่ได้")
        break

    results = model(frame, conf=0.5, verbose=False)

    cmd = "ไม่พบมือ"
    if results[0].boxes:
        best = max(results[0].boxes, key=lambda b: b.conf)
        class_id = int(best.cls)
        conf = float(best.conf)
        cmd = f"{CLASS_NAMES.get(class_id, '?')}  ({conf:.0%})"

    # แสดง bounding box
    frame = results[0].plot()

    # แสดง command บนหน้าจอ
    cv2.putText(frame, f"CMD: {cmd}", (20, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)

    cv2.imshow("Hand Gesture Test", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()