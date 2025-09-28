import React, { useCallback, useState } from 'react';
import { FileIcon, FeatureIcon } from './icons';

interface HomePageProps {
  onFileAccepted: (file: File) => void;
}

const supportedFormats = [
  { ext: '.rpgsave', desc: 'RPG Save', iconType: 'rpg' },
  { ext: '.rvdata2', desc: 'RPG Maker VX Ace', iconType: 'rpg' },
  { ext: '.dat', desc: 'Visual Novel Data', iconType: 'vn' },
  { ext: '.sav', desc: 'General Save', iconType: 'generic' },
  { ext: '.save', desc: 'General Save', iconType: 'generic' },
  { ext: '.sol', desc: 'Flash VN Save', iconType: 'vn' },
  { ext: '.lsd', desc: 'RPG Maker 2000/3', iconType: 'rpg' },
  { ext: '.rxdata', desc: 'RPG Maker XP', iconType: 'rpg' },
];

const features = [
  { name: 'Easy Upload', desc: 'Drag & drop simplicity.', icon: 'upload' },
  { name: 'Structured Editing', desc: 'Intuitive forms and controls.', icon: 'edit' },
  { name: 'Backup & Restore', desc: 'Download your original file anytime.', icon: 'backup' },
  { name: 'Secure & Private', desc: 'All processing is done in your browser.', icon: 'secure' },
];

export const HomePage: React.FC<HomePageProps> = ({ onFileAccepted }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileAccepted(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [onFileAccepted]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileAccepted(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200 font-sans p-4 sm:p-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.1),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.05),transparent_70%)]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <header className="text-center mb-16">
          <div className="inline-block mb-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent tracking-tight">
              GameSave
            </h1>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight mt-2">
              Studio
            </h2>
          </div>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            The modern, browser-based game save editor powered by AI
          </p>
          <div className="flex flex-wrap justify-center mt-6 text-sm text-gray-400 space-x-4">
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Zero Install Required
            </span>
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Privacy-First
            </span>
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              AI-Powered
            </span>
          </div>
        </header>

        <main className="w-full max-w-4xl mb-16">
          <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all duration-300 backdrop-blur-sm ${
                isDragging
                  ? 'border-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
          >
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <FeatureIcon
                  type="upload"
                  className={`w-20 h-20 transition-all duration-300 ${
                    isDragging ? 'text-blue-400 scale-110' : 'text-gray-500'
                  }`}
                />
                {isDragging && (
                  <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping"></div>
                )}
              </div>
              <p className={`text-xl font-semibold transition-colors duration-300 ${
                isDragging ? 'text-blue-300' : 'text-gray-300'
              }`}>
                {isDragging ? 'Release to upload your save file' : 'Drag & Drop your Save File Here'}
              </p>
              <p className="text-gray-500">or</p>
              <label htmlFor="file-upload" className={`
                cursor-pointer px-8 py-3 rounded-lg font-semibold transition-all duration-300
                bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600
                text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5
              `}>
                  Upload Save File
              </label>
              <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
        </main>

        <section className="w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 shadow-xl">
                <div className="flex items-center justify-center mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Key Features</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {features.map(feature => (
                        <div key={feature.name} className="group flex flex-col items-center text-center p-6 bg-gradient-to-br from-gray-700/60 to-gray-800/60 rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                            <FeatureIcon
                              type={feature.icon as any}
                              className="w-12 h-12 text-blue-400 group-hover:text-blue-300 mb-4 transition-colors duration-300"
                            />
                            <h3 className="font-semibold text-white text-lg mb-2">{feature.name}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 shadow-xl">
                <div className="flex items-center justify-center mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Supported Formats</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {supportedFormats.map(format => (
                        <div
                          key={format.ext}
                          className="flex flex-col items-center text-center p-4 bg-gradient-to-br from-gray-700/60 to-gray-800/60 rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                          title={format.desc}
                        >
                            <FileIcon type={format.iconType as any} className="w-12 h-12 text-gray-300 mb-3" />
                            <span className="font-mono text-sm text-blue-300 bg-gradient-to-r from-blue-900/60 to-purple-900/60 px-3 py-1.5 rounded-full font-medium">
                              {format.ext}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </section>

        <footer className="text-center mt-20 text-gray-500 text-sm">
            <p className="flex flex-wrap items-center justify-center space-x-2">
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12V4a1 1 0 10-2 0v2H7a1 1 0 000 2h6a1 1 0 100-2h-2z" clipRule="evenodd" />
              </svg>
              <span>&copy; {new Date().getFullYear()} GameSave Studio.</span>
              <span className="hidden sm:inline">All processing is done locally in your browser for privacy.</span>
              <span className="sm:hidden">Privacy & Security First</span>
            </p>
        </footer>
      </div>
    </div>
  );
};
