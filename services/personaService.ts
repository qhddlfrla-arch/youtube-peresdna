import type { Persona, PersonaGenerationRequest } from "../types";

const GEMINI_API_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * AI를 사용하여 페르소나를 생성합니다
 */
export async function generatePersona(
  apiKey: string,
  request: PersonaGenerationRequest
): Promise<Persona[]> {
  const count = request.count || 1;
  const specificTraits = request.specificTraits?.join(", ") || "없음";

  const prompt = `당신은 창작 콘텐츠를 위한 페르소나(인물) 생성 전문가입니다.

다음 요구사항에 맞는 ${count}개의 독특하고 생동감 있는 페르소나를 생성해주세요:

카테고리: ${request.category}
컨텍스트: ${request.context || "일반적인 콘텐츠 제작"}
특정 요구 특성: ${specificTraits}

각 페르소나는 다음 정보를 포함해야 합니다:
1. 이름 (창의적이고 기억하기 쉬운)
2. 나이 (숫자만)
3. 성별
4. 직업
5. 성격 특성 5가지 (배열 형태)
6. 말투/어투 설명
7. 배경 이야기 (2-3문장)
8. 추가 특성 3-5가지 (category와 value로 구성)

JSON 형식으로만 응답해주세요:
{
  "personas": [
    {
      "name": "페르소나 이름",
      "description": "한 줄 설명",
      "age": 25,
      "gender": "남성/여성/기타",
      "occupation": "직업",
      "personality": ["특성1", "특성2", "특성3", "특성4", "특성5"],
      "speechStyle": "말투 설명",
      "background": "배경 이야기",
      "traits": [
        {"category": "취미", "value": "독서"},
        {"category": "특기", "value": "피아노 연주"}
      ]
    }
  ]
}`;

  try {
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    // JSON 추출
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("유효한 JSON 응답을 찾을 수 없습니다");
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // ID와 타임스탬프 추가
    const now = new Date().toISOString();
    const personas: Persona[] = result.personas.map((p: any, index: number) => ({
      id: `persona-${Date.now()}-${index}`,
      ...p,
      createdAt: now,
      updatedAt: now,
    }));

    return personas;
  } catch (error) {
    console.error("페르소나 생성 중 오류:", error);
    throw error;
  }
}

/**
 * 페르소나를 개선/수정합니다
 */
export async function improvePersona(
  apiKey: string,
  persona: Persona,
  improvementRequest: string
): Promise<Persona> {
  const prompt = `다음 페르소나를 개선해주세요.

현재 페르소나:
이름: ${persona.name}
설명: ${persona.description}
나이: ${persona.age}
성별: ${persona.gender}
직업: ${persona.occupation}
성격: ${persona.personality.join(", ")}
말투: ${persona.speechStyle}
배경: ${persona.background}
추가 특성: ${JSON.stringify(persona.traits)}

개선 요청: ${improvementRequest}

JSON 형식으로 개선된 페르소나를 반환해주세요:
{
  "name": "이름",
  "description": "설명",
  "age": 나이,
  "gender": "성별",
  "occupation": "직업",
  "personality": ["특성1", "특성2", "특성3", "특성4", "특성5"],
  "speechStyle": "말투",
  "background": "배경",
  "traits": [{"category": "카테고리", "value": "값"}]
}`;

  try {
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("유효한 JSON 응답을 찾을 수 없습니다");
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      ...persona,
      ...result,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("페르소나 개선 중 오류:", error);
    throw error;
  }
}
