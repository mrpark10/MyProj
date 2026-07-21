const readline = require('readline');

  // Node.js 환경에서 사용자 입력을 처리하기 위한 인터페이스 설정
  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
  });

  function startGame() {
      // 1부터 100 사이의 임의의 정수를 생성합니다.
      const secretNumber = Math.floor(Math.random() * 100) + 1;
      let attempts = 0;
      let guessedNumber = null;

      console.log('====================================');
      console.log('🏆 숫자 맞추기 게임에 오신 것을 환영합니다! 🏆');
      console.log('저는 1부터 100 사이의 숫자를 생각했습니다.');
      console.log('당신의 추측을 입력해주세요!');
      console.log('====================================\n');

      /**
       * 사용자의 입력을 받고 게임 로직을 처리하는 함수
       */
      const askForGuess = () => {
          rl.question('정답을 추측하세요 (숫자): ', (input) => {
              attempts++;
              const guess = parseInt(input.trim());

              if (isNaN(guess) || guess < 1 || guess > 100) {
                  console.log(`\n⚠️  경고: 1부터 100 사이의 유효한 숫자를 입력해주세요.`);
                  askForGuess(); // 재귀 호출하여 다시 질문
                  return;
              }

              // 정답 비교 로직
              if (guess === secretNumber) {
                  console.log(`\n🎉 축하합니다! ${attempts}번 만에 정답 (${secretNumber})을 맞히셨습니다! 🎉`);
                  rl.close(); // 게임 종료 및 리스너 닫기
              } else if (guess < secretNumber) {
                  console.log(`\n👉 너무 낮습니다! 더 높은 숫자를 시도해보세요.`);
                  askForGuess();
              } else {
                  console.log(`\n👈 너무 높습니다! 더 낮은 숫자를 시도해보세요.`);
                  askForGuess();
              }
          });
      };

      // 게임 시작 요청
      askForGuess();
  }

  // 함수 실행
  startGame();