# 🚀 구매자 설정 가이드

이 프로젝트를 사용하기 전에 **반드시** 아래 단계를 따라 개인정보를 설정해주세요.

## ✅ 필수 설정 체크리스트

### 1. ⚠️ 애드센스 ID 교체 (수익화 필수!)

다음 파일에서 `ca-pub-YOUR-ADSENSE-ID`를 본인의 애드센스 ID로 교체하세요:

#### 📄 `index.html` (Line 76)
```html
<!-- 변경 전 -->
src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR-ADSENSE-ID"

<!-- 변경 후 -->
src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
```

#### 📄 `components/AdSense.tsx` (Line 29)
```tsx
// 변경 전
data-ad-client="ca-pub-YOUR-ADSENSE-ID"

// 변경 후
data-ad-client="ca-pub-1234567890123456"
```

#### 📄 `components/SidebarAds.tsx` (Line 27, 39)
```tsx
// 변경 전
data-ad-client="ca-pub-YOUR-ADSENSE-ID"
data-ad-slot="YOUR-AD-SLOT-ID"

// 변경 후
data-ad-client="ca-pub-1234567890123456"
data-ad-slot="1234567890"  // 본인의 광고 슬롯 ID
```

#### 📄 `components/FloatingAnchorAd.tsx` (Line 47)
```tsx
// 변경 전
data-ad-client="ca-pub-YOUR-ADSENSE-ID"

// 변경 후
data-ad-client="ca-pub-1234567890123456"
```

### 2. 🌐 도메인 교체

#### 📄 `index.html` (Line 23, 25, 30, 35, 39, 48, 52, 56, 63)

```html
<!-- 변경 전 -->
content="https://your-domain.com/"

<!-- 변경 후 -->
content="https://my-awesome-site.com/"
```

**교체할 위치:**
- Open Graph URL (Line 23)
- Open Graph Image (Line 35, 39)
- Twitter URL (Line 48)
- Twitter Image (Line 63)

### 3. 🔑 Gemini API 키 설정

#### 📄 `.env.local` 파일 생성

프로젝트 루트에 `.env.local` 파일을 만들고:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

**API 키 발급 방법:**
1. https://aistudio.google.com 접속
2. 'Get API Key' 클릭
3. 새 API 키 생성
4. 복사하여 `.env.local`에 붙여넣기

### 4. 📦 GitHub 저장소 설정 (선택사항)

본인의 GitHub 계정에 새 저장소를 만들고:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

### 5. 🚀 Vercel 배포 설정

1. https://vercel.com 접속
2. GitHub 연동
3. 프로젝트 Import
4. 환경 변수 설정:
   - Name: `GEMINI_API_KEY`
   - Value: 본인의 Gemini API 키
5. Deploy 클릭

## 🔍 개인정보 누락 확인 방법

프로젝트 내에서 다음 키워드를 검색하여 누락된 개인정보가 있는지 확인하세요:

```bash
# PowerShell에서 실행
Select-String -Path . -Pattern "ca-pub-YOUR-ADSENSE-ID" -Recurse
Select-String -Path . -Pattern "your-domain.com" -Recurse
Select-String -Path . -Pattern "YOUR-AD-SLOT-ID" -Recurse
```

결과가 없으면 모든 개인정보가 교체된 것입니다.

## 🎨 커스터마이징 (선택사항)

### 제목 및 설명 변경

#### 📄 `index.html`
```html
<!-- Line 8 -->
<title>여기에 본인의 사이트 제목</title>

<!-- Line 10-11 -->
<meta name="description" content="여기에 본인의 사이트 설명" />
```

### 파비콘 교체

`public/` 폴더에 본인의 아이콘 파일 추가:
- `favicon.ico`
- `favicon.svg`
- `icon-192.png`
- `icon-512.png`
- `apple-touch-icon.svg`

### OG 이미지 교체

`public/` 폴더에 본인의 OG 이미지 추가:
- `og-image.png` (1200x630)
- `og-image-square.png` (1200x1200)

## ⚙️ 테스트

모든 설정을 완료한 후:

1. **로컬 테스트**
```bash
npm install
npm run dev
```

2. **브라우저에서 http://localhost:3000 접속**

3. **기능 확인**
   - [ ] 페이지가 정상적으로 로드되는가?
   - [ ] API 키 입력 모달이 뜨는가?
   - [ ] 유튜브 URL 입력 후 분석이 되는가?
   - [ ] 광고가 표시되는가? (애드센스 승인 후)
   - [ ] 대본 생성이 작동하는가?
   - [ ] 다운로드가 정상 작동하는가?

## 🆘 문제 해결

### 광고가 안 보여요
- 애드센스 계정이 승인되었는지 확인
- 광고 슬롯 ID가 올바른지 확인
- 브라우저 애드블록을 끄고 테스트

### API 오류가 발생해요
- Gemini API 키가 올바른지 확인
- API 키에 사용량이 남아있는지 확인
- 브라우저 콘솔에서 정확한 오류 메시지 확인

### 배포 후 작동 안 해요
- Vercel 환경 변수가 설정되었는지 확인
- 빌드 로그에서 오류 확인
- 도메인 DNS 설정 확인 (커스텀 도메인 사용 시)

## 📞 지원

설정 중 문제가 발생하면:
1. README.md 의 문서 확인
2. DEPLOYMENT.md 의 배포 가이드 확인
3. 브라우저 콘솔의 오류 메시지 확인

## ⚠️ 중요 보안 주의사항

1. **절대 하지 마세요:**
   - API 키를 코드에 직접 입력하지 마세요
   - `.env` 파일을 GitHub에 커밋하지 마세요
   - 애드센스 계정 정보를 공유하지 마세요

2. **반드시 하세요:**
   - `.gitignore`에 `.env*` 파일이 포함되어 있는지 확인
   - 환경 변수는 Vercel 설정에서만 입력
   - 정기적으로 API 키 사용량 모니터링

## ✅ 완료 체크리스트

설정이 완료되었는지 확인하세요:

- [ ] 모든 파일에서 `ca-pub-YOUR-ADSENSE-ID` 교체 완료
- [ ] 모든 파일에서 `YOUR-AD-SLOT-ID` 교체 완료
- [ ] 모든 파일에서 `your-domain.com` 교체 완료
- [ ] `.env.local` 파일 생성 및 API 키 입력 완료
- [ ] 로컬에서 테스트 완료
- [ ] GitHub 저장소 생성 및 푸시 완료 (선택)
- [ ] Vercel 배포 및 환경 변수 설정 완료
- [ ] 배포된 사이트에서 기능 테스트 완료
- [ ] 애드센스 광고 확인 완료

---

**축하합니다! 🎉**
모든 설정이 완료되었습니다. 이제 본인의 유튜브 분석 AI 웹사이트를 운영할 수 있습니다!
