import React, { useState, useEffect } from "react";
import { FiSettings, FiTrash2, FiEdit2, FiPlus, FiDownload, FiRefreshCw } from "react-icons/fi";
import type { Persona, PersonaGenerationRequest } from "./types";
import { generatePersona, improvePersona } from "./services/personaService";
import ApiKeyModal from "./components/ApiKeyModal";
import Loader from "./components/Loader";
import Footer from "./components/Footer";
import { getStoredApiKey, saveApiKey } from "./utils/apiKeyStorage";

const personaCategories = [
  "유튜버",
  "강사/교육자",
  "게임 캐릭터",
  "소설 인물",
  "영화 캐릭터",
  "브이로거",
  "팟캐스트 진행자",
  "비즈니스 전문가",
  "예술가",
  "운동선수",
  "역사적 인물 (현대적 해석)",
  "판타지 캐릭터",
];

const App: React.FC = () => {
  // 상태 관리
  const [personas, setPersonas] = useState<Persona[]>(() => {
    const saved = localStorage.getItem("personas");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to restore personas:", e);
      }
    }
    return [];
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(personaCategories[0]);
  const [context, setContext] = useState<string>("");
  const [personaCount, setPersonaCount] = useState<number>(3);
  const [specificTraits, setSpecificTraits] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedPersona, setEditedPersona] = useState<Persona | null>(null);
  const [improvementRequest, setImprovementRequest] = useState<string>("");
  const [isImproving, setIsImproving] = useState<boolean>(false);

  // API 키 관리
  const [apiKey, setApiKey] = useState<string>("");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const storedKey = getStoredApiKey();
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  // localStorage에 페르소나 저장
  useEffect(() => {
    if (personas.length > 0) {
      localStorage.setItem("personas", JSON.stringify(personas));
    }
  }, [personas]);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    saveApiKey(key);
    setIsApiKeyModalOpen(false);
  };

  const handleGeneratePersonas = async () => {
    if (!apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    setIsGenerating(true);
    try {
      const request: PersonaGenerationRequest = {
        category: selectedCategory,
        context: context || undefined,
        count: personaCount,
        specificTraits: specificTraits ? specificTraits.split(",").map(t => t.trim()) : undefined,
      };

      const newPersonas = await generatePersona(apiKey, request);
      setPersonas([...personas, ...newPersonas]);
    } catch (error) {
      console.error("페르소나 생성 실패:", error);
      alert("페르소나 생성에 실패했습니다. API 키를 확인해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeletePersona = (id: string) => {
    if (confirm("이 페르소나를 삭제하시겠습니까?")) {
      setPersonas(personas.filter(p => p.id !== id));
      if (selectedPersona?.id === id) {
        setSelectedPersona(null);
      }
    }
  };

  const handleEditPersona = (persona: Persona) => {
    setEditedPersona({ ...persona });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editedPersona) {
      const updated = {
        ...editedPersona,
        updatedAt: new Date().toISOString(),
      };
      setPersonas(personas.map(p => p.id === updated.id ? updated : p));
      setSelectedPersona(updated);
      setIsEditing(false);
      setEditedPersona(null);
    }
  };

  const handleImprovePersona = async () => {
    if (!selectedPersona || !improvementRequest || !apiKey) return;

    setIsImproving(true);
    try {
      const improved = await improvePersona(apiKey, selectedPersona, improvementRequest);
      setPersonas(personas.map(p => p.id === improved.id ? improved : p));
      setSelectedPersona(improved);
      setImprovementRequest("");
    } catch (error) {
      console.error("페르소나 개선 실패:", error);
      alert("페르소나 개선에 실패했습니다.");
    } finally {
      setIsImproving(false);
    }
  };

  const handleExportPersona = (persona: Persona) => {
    const json = JSON.stringify(persona, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `persona-${persona.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    const json = JSON.stringify(personas, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `all-personas-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    if (confirm("모든 페르소나를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      setPersonas([]);
      setSelectedPersona(null);
      localStorage.removeItem("personas");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-zinc-900 text-white">
      {/* 헤더 */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                AI 페르소나 생성기
              </h1>
              <p className="text-sm text-neutral-400 mt-1">
                창의적인 캐릭터와 인물을 AI로 만들어보세요
              </p>
            </div>
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              title="API 키 설정"
            >
              <FiSettings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 페르소나 생성 */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiPlus className="w-5 h-5" />
                새 페르소나 생성
              </h2>

              {/* 카테고리 선택 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">카테고리</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {personaCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* 컨텍스트 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  컨텍스트 (선택사항)
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="예: SF 배경의 미래 세계, 중세 판타지 등..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 h-20 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>

              {/* 생성 개수 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  생성 개수: {personaCount}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={personaCount}
                  onChange={(e) => setPersonaCount(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* 특정 특성 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  특정 특성 (쉼표로 구분, 선택사항)
                </label>
                <input
                  type="text"
                  value={specificTraits}
                  onChange={(e) => setSpecificTraits(e.target.value)}
                  placeholder="예: 유머러스, 지적인, 낙천적"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* 생성 버튼 */}
              <button
                onClick={handleGeneratePersonas}
                disabled={isGenerating || !apiKey}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-zinc-700 disabled:to-zinc-700 text-white font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader />
                    생성 중...
                  </>
                ) : (
                  <>
                    <FiPlus className="w-5 h-5" />
                    페르소나 생성
                  </>
                )}
              </button>

              {/* 전체 관리 버튼 */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleExportAll}
                  disabled={personas.length === 0}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <FiDownload className="w-4 h-4" />
                  전체 내보내기
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={personas.length === 0}
                  className="flex-1 bg-red-900/50 hover:bg-red-900/70 disabled:bg-zinc-800 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <FiTrash2 className="w-4 h-4" />
                  전체 삭제
                </button>
              </div>
            </div>

            {/* 통계 */}
            <div className="mt-6 bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
              <h3 className="text-lg font-semibold mb-3">통계</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">총 페르소나:</span>
                  <span className="font-semibold">{personas.length}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">선택된 페르소나:</span>
                  <span className="font-semibold">
                    {selectedPersona ? selectedPersona.name : "없음"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 중간: 페르소나 목록 */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
              <h2 className="text-xl font-semibold mb-4">페르소나 목록 ({personas.length})</h2>
              
              {personas.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <p>아직 생성된 페르소나가 없습니다.</p>
                  <p className="text-sm mt-2">왼쪽에서 새로운 페르소나를 생성해보세요!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                  {personas.map((persona) => (
                    <div
                      key={persona.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedPersona?.id === persona.id
                          ? "bg-red-900/30 border-red-500"
                          : "bg-zinc-900/50 border-zinc-700 hover:border-zinc-600"
                      }`}
                      onClick={() => setSelectedPersona(persona)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{persona.name}</h3>
                          <p className="text-sm text-neutral-400 mt-1">{persona.description}</p>
                          <div className="flex gap-2 mt-2 text-xs text-neutral-500">
                            <span>{persona.age}세</span>
                            <span>•</span>
                            <span>{persona.gender}</span>
                            <span>•</span>
                            <span>{persona.occupation}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPersona(persona);
                            }}
                            className="p-2 hover:bg-zinc-700 rounded transition-colors"
                            title="편집"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePersona(persona.id);
                            }}
                            className="p-2 hover:bg-red-900/50 rounded transition-colors"
                            title="삭제"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 페르소나 상세 */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
              {selectedPersona ? (
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-semibold">{selectedPersona.name}</h2>
                    <button
                      onClick={() => handleExportPersona(selectedPersona)}
                      className="p-2 hover:bg-zinc-700 rounded transition-colors"
                      title="내보내기"
                    >
                      <FiDownload className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* 기본 정보 */}
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-400 mb-2">기본 정보</h3>
                      <div className="bg-zinc-900/50 rounded-lg p-3 space-y-2 text-sm">
                        <div><span className="text-neutral-400">설명:</span> {selectedPersona.description}</div>
                        <div><span className="text-neutral-400">나이:</span> {selectedPersona.age}세</div>
                        <div><span className="text-neutral-400">성별:</span> {selectedPersona.gender}</div>
                        <div><span className="text-neutral-400">직업:</span> {selectedPersona.occupation}</div>
                      </div>
                    </div>

                    {/* 성격 */}
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-400 mb-2">성격</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedPersona.personality.map((trait, index) => (
                          <span
                            key={index}
                            className="bg-red-900/30 border border-red-700 px-3 py-1 rounded-full text-sm"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 말투 */}
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-400 mb-2">말투/어투</h3>
                      <div className="bg-zinc-900/50 rounded-lg p-3 text-sm">
                        {selectedPersona.speechStyle}
                      </div>
                    </div>

                    {/* 배경 */}
                    {selectedPersona.background && (
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-400 mb-2">배경 이야기</h3>
                        <div className="bg-zinc-900/50 rounded-lg p-3 text-sm">
                          {selectedPersona.background}
                        </div>
                      </div>
                    )}

                    {/* 추가 특성 */}
                    {selectedPersona.traits && selectedPersona.traits.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-400 mb-2">추가 특성</h3>
                        <div className="space-y-2">
                          {selectedPersona.traits.map((trait, index) => (
                            <div key={index} className="bg-zinc-900/50 rounded-lg p-2 text-sm flex justify-between">
                              <span className="text-neutral-400">{trait.category}:</span>
                              <span>{trait.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI 개선 */}
                    <div className="border-t border-zinc-700 pt-4 mt-4">
                      <h3 className="text-sm font-semibold text-neutral-400 mb-2">AI 개선 요청</h3>
                      <textarea
                        value={improvementRequest}
                        onChange={(e) => setImprovementRequest(e.target.value)}
                        placeholder="예: 더 유머러스하게 만들어줘, 배경을 더 상세하게..."
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 h-20 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none mb-2"
                      />
                      <button
                        onClick={handleImprovePersona}
                        disabled={isImproving || !improvementRequest}
                        className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        {isImproving ? (
                          <>
                            <Loader />
                            개선 중...
                          </>
                        ) : (
                          <>
                            <FiRefreshCw className="w-4 h-4" />
                            AI로 개선하기
                          </>
                        )}
                      </button>
                    </div>

                    {/* 메타 정보 */}
                    <div className="text-xs text-neutral-500 pt-4 border-t border-zinc-700">
                      <div>생성: {new Date(selectedPersona.createdAt).toLocaleString('ko-KR')}</div>
                      <div>수정: {new Date(selectedPersona.updatedAt).toLocaleString('ko-KR')}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-400">
                  <p>페르소나를 선택해주세요</p>
                  <p className="text-sm mt-2">왼쪽 목록에서 페르소나를 클릭하면 상세 정보를 볼 수 있습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <Footer />

      {/* API 키 모달 */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
        currentApiKey={apiKey}
      />

      {/* 편집 모달 */}
      {isEditing && editedPersona && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl border border-zinc-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">페르소나 편집</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">이름</label>
                  <input
                    type="text"
                    value={editedPersona.name}
                    onChange={(e) => setEditedPersona({ ...editedPersona, name: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">설명</label>
                  <input
                    type="text"
                    value={editedPersona.description}
                    onChange={(e) => setEditedPersona({ ...editedPersona, description: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">나이</label>
                    <input
                      type="number"
                      value={editedPersona.age}
                      onChange={(e) => setEditedPersona({ ...editedPersona, age: Number(e.target.value) })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">성별</label>
                    <input
                      type="text"
                      value={editedPersona.gender}
                      onChange={(e) => setEditedPersona({ ...editedPersona, gender: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">직업</label>
                    <input
                      type="text"
                      value={editedPersona.occupation}
                      onChange={(e) => setEditedPersona({ ...editedPersona, occupation: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">성격 (쉼표로 구분)</label>
                  <input
                    type="text"
                    value={editedPersona.personality.join(", ")}
                    onChange={(e) => setEditedPersona({ 
                      ...editedPersona, 
                      personality: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                    })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">말투</label>
                  <textarea
                    value={editedPersona.speechStyle}
                    onChange={(e) => setEditedPersona({ ...editedPersona, speechStyle: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 h-20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">배경</label>
                  <textarea
                    value={editedPersona.background || ""}
                    onChange={(e) => setEditedPersona({ ...editedPersona, background: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 h-24 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 rounded-lg font-medium transition-all"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedPersona(null);
                  }}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
