import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BlueprintViewer } from '@/components/BlueprintViewer';
import { Button } from '@/components/ui/Button';
import { Upload, FileImage, FileText } from 'lucide-react';

interface Measurement {
  id: string;
  type: 'distance' | 'area' | 'angle';
  points: { x: number; y: number }[];
  value: number;
  unit: string;
  color: string;
  name: string;
}

export function BlueprintDemoPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke previous URL to prevent memory leaks
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }

      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setFileName(file.name);
      setMeasurements([]); // Reset measurements for new file
    }
  };

  const handleMeasurementCreate = (measurement: Omit<Measurement, 'id'>) => {
    const newMeasurement: Measurement = {
      ...measurement,
      id: `m-${Date.now()}`,
    };
    setMeasurements((prev) => [...prev, newMeasurement]);
  };

  const handleMeasurementDelete = (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  // Sample images for quick testing
  const sampleImages = [
    {
      name: 'Floor Plan Sample',
      url: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200',
    },
    {
      name: 'Architecture Blueprint',
      url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isArabic ? 'عارض المخططات' : 'Blueprint Viewer'}
          </h1>
          <p className="text-gray-600">
            {isArabic
              ? 'قم بتحميل صورة أو ملف PDF لعرضه وقياس المسافات والمساحات'
              : 'Upload an image or PDF to view and measure distances and areas'
            }
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            {/* File Upload */}
            <label className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-hover transition-colors">
              <Upload className="w-5 h-5" />
              {isArabic ? 'تحميل ملف' : 'Upload File'}
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Sample Images */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500">
                {isArabic ? 'أو جرب:' : 'Or try:'}
              </span>
              {sampleImages.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFileUrl(sample.url);
                    setFileName(sample.name);
                    setMeasurements([]);
                  }}
                >
                  <FileImage className="w-4 h-4 mr-1" />
                  {sample.name}
                </Button>
              ))}
            </div>
          </div>

          {fileName && (
            <div className="mt-4 text-center text-sm text-gray-600">
              {isArabic ? 'الملف الحالي:' : 'Current file:'} <strong>{fileName}</strong>
            </div>
          )}
        </div>

        {/* Blueprint Viewer */}
        {fileUrl ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <BlueprintViewer
              src={fileUrl}
              alt={fileName}
              measurements={measurements}
              onMeasurementCreate={handleMeasurementCreate}
              onMeasurementDelete={handleMeasurementDelete}
              showMeasurements={true}
              editable={true}
              className="h-[600px]"
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center">
            <div className="flex justify-center gap-4 mb-4">
              <FileImage className="w-16 h-16 text-gray-300" />
              <FileText className="w-16 h-16 text-gray-300" />
            </div>
            <p className="text-gray-500 text-lg">
              {isArabic
                ? 'قم بتحميل صورة أو ملف PDF للبدء'
                : 'Upload an image or PDF to get started'
              }
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {isArabic
                ? 'يدعم: JPG, PNG, GIF, WebP, PDF'
                : 'Supports: JPG, PNG, GIF, WebP, PDF'
              }
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? 'كيفية الاستخدام' : 'How to Use'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">
                {isArabic ? 'أدوات التنقل' : 'Navigation Tools'}
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>{isArabic ? '• استخدم عجلة الماوس للتكبير/التصغير' : '• Use mouse wheel to zoom in/out'}</li>
                <li>{isArabic ? '• اسحب للتحريك في وضع التحريك' : '• Drag to pan in pan mode'}</li>
                <li>{isArabic ? '• انقر على زر التدوير للتدوير 90 درجة' : '• Click rotate button to rotate 90°'}</li>
                <li>{isArabic ? '• انقر على زر التوسيط لإعادة العرض' : '• Click center button to reset view'}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">
                {isArabic ? 'أدوات القياس' : 'Measurement Tools'}
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>{isArabic ? '• المسطرة: انقر نقطتين لقياس المسافة' : '• Ruler: Click two points to measure distance'}</li>
                <li>{isArabic ? '• المربع: انقر عدة نقاط، انقر مزدوج للإنهاء' : '• Square: Click multiple points, double-click to finish'}</li>
                <li>{isArabic ? '• يمكنك إخفاء/إظهار القياسات من اللوحة' : '• You can hide/show measurements from the panel'}</li>
                <li>{isArabic ? '• انقر على سلة المهملات لحذف قياس' : '• Click trash icon to delete a measurement'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlueprintDemoPage;
