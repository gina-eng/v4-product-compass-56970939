import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UseCaseMapData {
  problema: string;
  persona: string;
  alternativa: string;
  why: string;
  frequencia: string;
}

interface UseCaseMapProps {
  title: string;
  data: UseCaseMapData;
  onChange?: (data: UseCaseMapData) => void;
  readOnly?: boolean;
}

const UseCaseMap = ({ title, data, onChange, readOnly = true }: UseCaseMapProps) => {
  const handleChange = (field: keyof UseCaseMapData, value: string) => {
    if (onChange) {
      onChange({ ...data, [field]: value });
    }
  };

  const fields = [
    { key: 'problema', label: 'P - Problema', color: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' },
    { key: 'persona', label: 'P - Persona', color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' },
    { key: 'alternativa', label: 'A - Alternativa', color: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800' },
    { key: 'why', label: 'W - Why', color: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' },
    { key: 'frequencia', label: 'F - Frequência', color: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((field) => (
            <div key={field.key} className={`p-4 rounded-lg border ${field.color}`}>
              <span className="text-sm font-bold text-foreground block mb-2">
                {field.label}:
              </span>
              {readOnly ? (
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {data[field.key as keyof UseCaseMapData] || 'Não definido'}
                </div>
              ) : (
                <textarea
                  value={data[field.key as keyof UseCaseMapData] || ''}
                  onChange={(e) => handleChange(field.key as keyof UseCaseMapData, e.target.value)}
                  className="w-full p-2 text-sm border rounded resize-none bg-white dark:bg-gray-900"
                  rows={3}
                  placeholder={`Digite ${field.label.toLowerCase()}`}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UseCaseMap;