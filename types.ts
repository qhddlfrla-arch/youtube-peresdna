// 페르소나 관련 타입 정의
export interface PersonaTrait {
  category: string; // 특성 카테고리 (예: 성격, 말투, 특징 등)
  value: string;    // 특성 값
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  age?: number;
  gender?: string;
  occupation?: string;
  personality: string[];
  speechStyle: string;
  background?: string;
  traits: PersonaTrait[];
  createdAt: string;
  updatedAt: string;
}

export interface PersonaGenerationRequest {
  category: string;      // 페르소나 카테고리 (예: 유튜버, 강사, 캐릭터 등)
  context?: string;      // 추가 컨텍스트
  count?: number;        // 생성할 페르소나 수
  specificTraits?: string[]; // 특정 특성 요구사항
}

export interface PersonaTemplate {
  id: string;
  name: string;
  description: string;
  requiredFields: string[];
  optionalFields: string[];
}