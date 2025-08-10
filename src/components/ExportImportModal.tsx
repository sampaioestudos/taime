import React from 'react';
import Modal from './Modal';
import FileUploader from './FileUploader';
import { useTranslation } from '../i18n';
import { ExportIcon, ImportIcon } from './icons';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'json' | 'csv') => void;
  onImport: (fileContent: string) => void;
}

const ExportImportModal: React.FC<ExportImportModalProps> = ({ isOpen, onClose, onExport, onImport }) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-2">
        <h2 className="text-xl font-bold text-white mb-6 text-center">{t('exportImportTitle')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Section */}
            <div className="bg-gray-700/50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg text-cyan-400 mb-4 flex items-center gap-2"><ExportIcon className="w-5 h-5" />Export</h3>
                <div className="space-y-3">
                    <button
                        onClick={() => onExport('json')}
                        className="w-full bg-cyan-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-cyan-500 transition-colors"
                    >
                        {t('exportAsJson')}
                    </button>
                     <button
                        onClick={() => onExport('csv')}
                        className="w-full bg-teal-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-teal-500 transition-colors"
                    >
                        {t('exportAsCsv')}
                    </button>
                </div>
            </div>

            {/* Import Section */}
            <div className="bg-gray-700/50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg text-cyan-400 mb-4 flex items-center gap-2"><ImportIcon className="w-5 h-5" />{t('importFromJson')}</h3>
                <p className="text-sm text-gray-400 mb-4">{t('importDescription')}</p>
                <FileUploader onFileLoaded={onImport} />
            </div>
        </div>
      </div>
    </Modal>
  );
};

export default ExportImportModal;