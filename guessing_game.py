import random
import tkinter as tk
from tkinter import messagebox


class NumberGuessingGame:
    def __init__(self, root):
        """GUI 초기화 및 게임 상태 설정"""
        self.root = root
        self.root.title("숫자 맞추기 게임 (1 ~ 100)")
        self.root.geometry("400x480")
        self.root.resizable(False, False)
        self.root.config(bg="#f0f4f8")

        # 게임 변수 초기화
        self.secret_number = 0
        self.attempts_left = 0
        self.max_attempts = 10
        self.history = []

        # UI 요소 생성
        self.create_widgets()

        # 게임 시작
        self.reset_game()

    def create_widgets(self):
        """GUI 화면 구성 요소를 생성하고 배치합니다."""

        # 1. 메인 타이틀
        title_label = tk.Label(
            self.root,
            text="🎯 숫자 맞추기 게임",
            font=("맑은 고딕", 18, "bold"),
            bg="#f0f4f8",
            fg="#1e293b",
        )
        title_label.pack(pady=(20, 10))

        # 2. 게임 설명 문구
        sub_label = tk.Label(
            self.root,
            text="1부터 100 사이의 숫자를 맞춰보세요!",
            font=("맑은 고딕", 10),
            bg="#f0f4f8",
            fg="#64748b",
        )
        sub_label.pack(pady=(0, 15))

        # 3. 힌트 및 상태 표시 영역
        self.status_label = tk.Label(
            self.root,
            text="숫자를 입력하고 [제출]을 누르세요.",
            font=("맑은 고딕", 12, "bold"),
            bg="#ffffff",
            fg="#0f172a",
            width=32,
            height=2,
            relief="solid",
            bd=1,
        )
        self.status_label.pack(pady=10)

        # 4. 남은 기회 표시
        self.attempts_label = tk.Label(
            self.root,
            text=f"남은 기회: {self.max_attempts}회",
            font=("맑은 고딕", 11, "bold"),
            bg="#f0f4f8",
            fg="#ef4444",
        )
        self.attempts_label.pack(pady=5)

        # 5. 입력창 (Entry) 및 제출 버튼 프레임
        input_frame = tk.Frame(self.root, bg="#f0f4f8")
        input_frame.pack(pady=15)

        self.guess_entry = tk.Entry(
            input_frame,
            font=("맑은 고딕", 14),
            width=8,
            justify="center",
            bd=2,
            relief="groove",
        )
        self.guess_entry.pack(side="left", padx=5)
        # 엔터키를 누르면 바로 제출되도록 이벤트 바인딩
        self.guess_entry.bind("<Return>", lambda event: self.check_guess())

        self.submit_btn = tk.Button(
            input_frame,
            text="제출",
            font=("맑은 고딕", 11, "bold"),
            bg="#2563eb",
            fg="white",
            activebackground="#1d4ed8",
            activeforeground="white",
            padx=15,
            pady=2,
            command=self.check_guess,
            cursor="hand2",
        )
        self.submit_btn.pack(side="left", padx=5)

        # 6. 이전 시도 기록 표시 박스
        history_frame = tk.Frame(self.root, bg="#f0f4f8")
        history_frame.pack(pady=5)

        history_title = tk.Label(
            history_frame,
            text="[ 내가 입력한 숫자들 ]",
            font=("맑은 고딕", 9),
            bg="#f0f4f8",
            fg="#475569",
        )
        history_title.pack()

        self.history_label = tk.Label(
            history_frame,
            text="없음",
            font=("맑은 고딕", 9),
            bg="#f0f4f8",
            fg="#64748b",
            wraplength=350,
        )
        self.history_label.pack(pady=2)

        # 7. 재시작 버튼
        self.reset_btn = tk.Button(
            self.root,
            text="🔄 게임 다시 시작",
            font=("맑은 고딕", 10),
            bg="#64748b",
            fg="white",
            activebackground="#475569",
            activeforeground="white",
            command=self.reset_game,
            cursor="hand2",
        )
        self.reset_btn.pack(side="bottom", pady=20)

    def reset_game(self):
        """새로운 게임을 시작하기 위해 난수 및 상태값을 초기화합니다."""
        self.secret_number = random.randint(1, 100)
        self.attempts_left = self.max_attempts
        self.history = []

        self.status_label.config(
            text="새 게임 시작! 숫자를 입력하세요.", fg="#0f172a"
        )
        self.attempts_label.config(
            text=f"남은 기회: {self.attempts_left}회", fg="#ef4444"
        )
        self.history_label.config(text="없음")
        self.guess_entry.config(state="normal")
        self.submit_btn.config(state="normal")
        self.guess_entry.delete(0, tk.END)
        self.guess_entry.focus()

    def check_guess(self):
        """사용자가 입력한 숫자를 판별하는 메인 로직"""
        user_input = self.guess_entry.get().strip()

        # 예외 처리 1: 빈 값 또는 숫자가 아닌 경우
        if not user_input.isdigit():
            messagebox.showwarning(
                "입력 오류", "1부터 100 사이의 '숫자'만 입력해 주세요!"
            )
            self.guess_entry.delete(0, tk.END)
            return

        guess = int(user_input)

        # 예외 처리 2: 범위를 벗어난 경우
        if guess < 1 or guess > 100:
            messagebox.showwarning(
                "범위 초과", "1부터 100 사이의 숫자를 입력해 주세요."
            )
            self.guess_entry.delete(0, tk.END)
            return

        # 기회 차감 및 기록 추가
        self.attempts_left -= 1
        self.history.append(str(guess))
        self.history_label.config(text=", ".join(self.history))
        self.attempts_label.config(text=f"남은 기회: {self.attempts_left}회")

        # 정답 여부 판별
        if guess == self.secret_number:
            self.status_label.config(
                text=f"🎉 정답입니다! ({guess})", fg="#16a34a"
            )
            messagebox.showinfo(
                "승리!",
                f"축하합니다! {self.max_attempts - self.attempts_left}번 만에 맞추셨습니다!",
            )
            self.end_game()
        elif self.attempts_left == 0:
            self.status_label.config(
                text=f"💀 실패! 정답은 [{self.secret_number}] 였습니다.",
                fg="#dc2626",
            )
            messagebox.showerror(
                "게임 오버",
                f"기회를 모두 사용하셨습니다.\n정답은 {self.secret_number} 였습니다.",
            )
            self.end_game()
        elif guess < self.secret_number:
            self.status_label.config(
                text=f"⬆️ UP! ({guess}보다 큽니다)", fg="#2563eb"
            )
        else:
            self.status_label.config(
                text=f"⬇️ DOWN! ({guess}보다 작습니다)", fg="#ea580c"
            )

        # 입력창 초기화 및 포커스 유지
        self.guess_entry.delete(0, tk.END)

    def end_game(self):
        """게임 종료 시 입력창과 버튼을 비활성화합니다."""
        self.guess_entry.config(state="disabled")
        self.submit_btn.config(state="disabled")


# 앱 실행부
if __name__ == "__main__":
    root = tk.Tk()
    app = NumberGuessingGame(root)
    root.mainloop()