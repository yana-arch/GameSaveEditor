
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
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-8 flex flex-col items-center">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">GameSave <span className="text-blue-400">Studio</span></h1>
        <p className="text-lg text-gray-400 mt-2">The modern, browser-based game save editor.</p>
      </header>

      <main className="w-full max-w-4xl mb-16">
        <div 
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all duration-300 ${isDragging ? 'border-blue-400 bg-gray-800' : 'border-gray-600 bg-gray-800/50'}`}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <FeatureIcon type="upload" className="w-16 h-16 text-gray-500" />
            <p className="text-xl font-semibold text-gray-300">Drag & Drop your Save File Here</p>
            <p className="text-gray-500">or</p>
            <label htmlFor="file-upload" className="cursor-pointer bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                Upload Save File
            </label>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
          </div>
        </div>
      </main>

      <section className="w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            <div className="bg-gray-800/50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Key Features</h2>
                <div className="grid grid-cols-2 gap-6">
                    {features.map(feature => (
                        <div key={feature.name} className="flex flex-col items-center text-center p-4 bg-gray-700/50 rounded-lg">
                            <FeatureIcon type={feature.icon as any} className="w-10 h-10 text-blue-400 mb-3" />
                            <h3 className="font-semibold text-white">{feature.name}</h3>
                            <p className="text-sm text-gray-400">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Supported Formats</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {supportedFormats.map(format => (
                        <div key={format.ext} className="flex flex-col items-center text-center p-3 bg-gray-700/50 rounded-lg" title={format.desc}>
                            <FileIcon type={format.iconType as any} className="w-10 h-10 text-gray-300 mb-2" />
                            <span className="font-mono text-sm text-blue-300 bg-blue-900/50 px-2 py-1 rounded">{format.ext}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>
       <footer className="text-center mt-16 text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} GameSave Studio. All processing is done locally in your browser for privacy.</p>
        </footer>
    </div>
  );
};
