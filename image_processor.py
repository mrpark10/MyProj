import json
from typing import Any, Dict, List

# Pillow 라이브러리 임포트 확인
try:
    from PIL import Image
except ImportError:
    Image = None

def process_image_areas(image_paths: List[str]) -> str:
    """이미지 경로 목록을 받아 너비, 높이, 면적(픽셀 수)을 계산하고 JSON 문자열로 반환합니다."""
    if not Image:
        return json.dumps(
            {"error": "Pillow 라이브러리가 필요합니다. 'pip install Pillow'로 설치해 주세요."}
        )

    results = []
    for path in image_paths:
        metadata = {"path": path, "status": "success"}
        try:
            # with 문을 사용하여 파일 리소스가 자동으로 안전하게 닫히도록 수정
            with Image.open(path) as img:
                width, height = img.size
                area = width * height

            metadata["dimensions"] = {"width": width, "height": height}
            metadata["area"] = area
        except FileNotFoundError:
            metadata["status"] = "error"
            metadata["message"] = f"파일을 찾을 수 없습니다: {path}"
        except Exception as e:
            metadata["status"] = "error"
            metadata["message"] = f"이미지 처리 중 오류 발생: {str(e)}"

        results.append(metadata)

    return json.dumps({"processed_images": results}, indent=4, ensure_ascii=False)


if __name__ == "__main__":
    # 테스트용 경로 (실제 파일 경로로 변경하여 테스트하세요)
    test_paths = [
        "test_image.jpg",
        "non_existent_file.png",  # FileNotFoundError 테스트용
    ]

    print("--- 이미지 프로세서 실행 예시 ---")
    json_output = process_image_areas(test_paths)
    print("\nJSON 출력 결과:")
    print(json_output)