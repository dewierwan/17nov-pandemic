import { Newspaper, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useSimulationStore } from '../../features/simulation/store/simulationStore';

export default function BreakingNews() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { state, sendMessageToAI, aiResponse, isLoadingAi, newsHistory } = useSimulationStore();

  const handleGenerateNews = async () => {
    await sendMessageToAI("Generate a news story for today's situation.", 'news');
  };

  return (
    <div className="hidden 2xl:block fixed right-6 top-32 w-96 max-h-[calc(100vh-9rem)] overflow-y-auto z-10">
      <div className="bg-white rounded-xl shadow-lg">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-6"
        >
          <div className="flex items-center space-x-2">
            <Newspaper className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold">Breaking News</h2>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {isExpanded && (
          <div className="border-t">
            <div className="p-6 space-y-4">
              {state.hasStarted ? (
                <>
                  <button
                    onClick={handleGenerateNews}
                    disabled={isLoadingAi}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingAi ? 'animate-spin' : ''}`} />
                    <span>{isLoadingAi ? 'Generating...' : 'Generate News Story'}</span>
                  </button>
                  
                  <div className="space-y-6">
                    {newsHistory.slice().reverse().map((story, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold">{story.headline}</h3>
                          <span className="text-sm text-gray-500">Day {story.day}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{story.newspaper}</p>
                        <div className="prose prose-sm max-w-none">
                          {story.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center">
                  Start the simulation to generate news stories
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 