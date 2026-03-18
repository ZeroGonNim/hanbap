# 🚨 개발 환경 이슈 및 해결 가이드: 인코딩(BOM/Mojibake) 문제

## 📌 문제 현상 (Mojibake / 500 Error)
- **증상**: Vite 환경에서 Unexpected character 혹은 Unterminated string constant 등 500 에러 발생. 에디터(VS Code)에서 한글이나 영문이 알 수 없는 한문(예: 浩潰)이나 깨진 글자로 표시됨.
- **원인**:
  1. 파일이 **UTF-16 LE (BOM 포함)** 포맷으로 저장되어, Vite의 Babel 컴파일러가 이를 정상적인 UTF-8 텍스트로 읽지 못함. (바이트 단위의 오작동)
  2. PowerShell 등의 CLI에서 인코딩을 명시하지 않고(-Encoding 옵션 누락) Get-Content 등을 사용해 파일을 다시 쓰면, 바이트가 이중으로 꼬이면서 소스코드 자체가 완전히 망가짐.
  3. **가장 흔한 함정**: 서버/터미널 단에서 파일을 정상적인 UTF-8로 강제 변환하더라도, **VS Code 에디터가 과거의 잘못된 인코딩 캐시(UTF-16)를 기억**하고 있어서 멀쩡한 코드를 한문으로 오작동하여 보여줌.

## 🛠️ 해결 및 방지 가이드 (필독)

### 1. 완벽한 바이트 레벨 강제 변환 (.NET 방식)
일반적인 CLI 명령어 대신 안전한 .NET 클래스를 사용하여 폴더 전체 소스를 BOM 없는 순수 UTF-8로 리셋해야 함.
`powershell
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
Get-ChildItem src -Recurse -Include *.tsx, *.ts, *.css | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    [System.IO.File]::WriteAllText($_.FullName, $content, $utf8NoBom)
}
`

### 2. 에디터 차원의 이중 보호 방벽 설정 (.vscode/settings.json)
VS Code가 멋대로 인코딩을 추측하여 파일을 깨뜨리지 못하도록, 프로젝트 최상단에 강제 룰을 심어둠.
`json
// .vscode/settings.json
{
  "files.encoding": "utf8",
  "files.autoGuessEncoding": false
}
`

### 🚨 경고 (절대 주의 사항)
- 파일 인코딩 문서를 다룰 때 절대로 단순 Get-Content를 이용한 덮어쓰기를 하지 말 것. 소스코드가 영구적으로 손상됨.
- 에디터 화면에 코드가 한문으로 나온다고 해서 "코드가 날아갔다"고 착각하고 파일 리라이트(Rewrite)를 하지 말 것. **실제 데이터는 정상일 확률이 99%** 이며, 우측 하단의 VS Code 인코딩 표시기를 눌러 인코딩하여 다시 열기 -> UTF-8로 세팅만 해주면 즉각 복구됨.
