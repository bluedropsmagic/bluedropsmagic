import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Eye, Code, Type, Image, Link, Palette, RefreshCw } from 'lucide-react';

interface EditableElement {
  id: string;
  type: 'text' | 'image' | 'link' | 'button';
  selector: string;
  label: string;
  currentValue: string;
  property: 'textContent' | 'src' | 'href' | 'innerHTML' | 'style';
}

export const InlineEditor: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableElements, setEditableElements] = useState<EditableElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<EditableElement | null>(null);
  const [editValue, setEditValue] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [changes, setChanges] = useState<Map<string, string>>(new Map());

  // Scan page for editable elements
  const scanEditableElements = () => {
    const elements: EditableElement[] = [];
    
    // Common selectors for editable content
    const selectors = [
      // Headlines
      { selector: 'h1', type: 'text' as const, property: 'textContent' as const, label: 'Main Headlines' },
      { selector: 'h2', type: 'text' as const, property: 'textContent' as const, label: 'Section Headlines' },
      { selector: 'h3', type: 'text' as const, property: 'textContent' as const, label: 'Sub Headlines' },
      
      // Paragraphs and descriptions
      { selector: 'p', type: 'text' as const, property: 'textContent' as const, label: 'Paragraphs' },
      
      // Buttons
      { selector: 'button', type: 'button' as const, property: 'textContent' as const, label: 'Buttons' },
      
      // Images
      { selector: 'img', type: 'image' as const, property: 'src' as const, label: 'Images' },
      
      // Links
      { selector: 'a', type: 'link' as const, property: 'href' as const, label: 'Links' },
      
      // Spans with text
      { selector: 'span', type: 'text' as const, property: 'textContent' as const, label: 'Text Spans' }
    ];

    selectors.forEach(({ selector, type, property, label }) => {
      const domElements = document.querySelectorAll(selector);
      domElements.forEach((element, index) => {
        const value = element[property as keyof Element] as string || '';
        
        // Skip empty elements or very short content
        if (!value || value.trim().length < 3) return;
        
        // Skip script/style content
        if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') return;
        
        // Create unique ID
        const elementId = `${selector.replace(/[^a-zA-Z0-9]/g, '_')}_${index}`;
        
        elements.push({
          id: elementId,
          type,
          selector: `${selector}:nth-of-type(${index + 1})`,
          label: `${label} #${index + 1}`,
          currentValue: value,
          property
        });
      });
    });

    setEditableElements(elements);
    console.log('📝 Found', elements.length, 'editable elements');
  };

  // Apply changes to the DOM
  const applyChanges = () => {
    changes.forEach((newValue, elementId) => {
      const element = editableElements.find(el => el.id === elementId);
      if (!element) return;

      const domElement = document.querySelector(element.selector);
      if (domElement) {
        if (element.property === 'textContent') {
          domElement.textContent = newValue;
        } else if (element.property === 'innerHTML') {
          domElement.innerHTML = newValue;
        } else if (element.property === 'src') {
          (domElement as HTMLImageElement).src = newValue;
        } else if (element.property === 'href') {
          (domElement as HTMLAnchorElement).href = newValue;
        }
        
        console.log('✅ Applied change to', element.selector, ':', newValue);
      }
    });
    
    // Update elements list with new values
    setEditableElements(prev => prev.map(el => {
      const newValue = changes.get(el.id);
      return newValue ? { ...el, currentValue: newValue } : el;
    }));
    
    setChanges(new Map());
    setIsEditing(false);
    setSelectedElement(null);
  };

  // Start editing an element
  const startEditing = (element: EditableElement) => {
    setSelectedElement(element);
    setEditValue(changes.get(element.id) || element.currentValue);
    setIsEditing(true);
  };

  // Save current edit
  const saveEdit = () => {
    if (!selectedElement) return;
    
    const newChanges = new Map(changes);
    newChanges.set(selectedElement.id, editValue);
    setChanges(newChanges);
    
    setSelectedElement(null);
    setEditValue('');
  };

  // Cancel current edit
  const cancelEdit = () => {
    setSelectedElement(null);
    setEditValue('');
  };

  // Toggle preview mode
  const togglePreview = () => {
    if (previewMode) {
      // Exit preview - revert changes
      window.location.reload();
    } else {
      // Enter preview - apply changes temporarily
      applyChanges();
      setPreviewMode(true);
    }
  };

  // Get element type icon
  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'link': return <Link className="w-4 h-4" />;
      case 'button': return <Palette className="w-4 h-4" />;
      default: return <Edit className="w-4 h-4" />;
    }
  };

  // Get element type color
  const getElementColor = (type: string) => {
    switch (type) {
      case 'text': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'image': return 'text-green-600 bg-green-50 border-green-200';
      case 'link': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'button': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Initial scan on component mount
  useEffect(() => {
    scanEditableElements();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Edit className="w-6 h-6" />
              📝 Editor Inline da Landing Page
            </h2>
            <p className="text-gray-600 mt-1">
              Edite qualquer elemento da página diretamente no admin
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={scanEditableElements}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Reescanear
            </button>
            
            <button
              onClick={togglePreview}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium ${
                previewMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {previewMode ? (
                <>
                  <X className="w-4 h-4" />
                  Sair Preview
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Preview Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Type className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Textos</span>
            </div>
            <p className="text-xl font-bold text-blue-800">
              {editableElements.filter(el => el.type === 'text').length}
            </p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <Image className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Imagens</span>
            </div>
            <p className="text-xl font-bold text-green-800">
              {editableElements.filter(el => el.type === 'image').length}
            </p>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <Link className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Links</span>
            </div>
            <p className="text-xl font-bold text-purple-800">
              {editableElements.filter(el => el.type === 'link').length}
            </p>
          </div>
          
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <Palette className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Botões</span>
            </div>
            <p className="text-xl font-bold text-orange-800">
              {editableElements.filter(el => el.type === 'button').length}
            </p>
          </div>
        </div>

        {/* Changes Summary */}
        {changes.size > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">
              📝 Alterações Pendentes: {changes.size}
            </h4>
            <div className="flex items-center gap-3">
              <button
                onClick={applyChanges}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                Aplicar Todas as Alterações
              </button>
              
              <button
                onClick={() => {
                  setChanges(new Map());
                  setSelectedElement(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Descartar Alterações
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedElement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getElementIcon(selectedElement.type)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Editando: {selectedElement.label}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Selector: <code className="bg-gray-100 px-1 rounded">{selectedElement.selector}</code>
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={cancelEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Current Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Atual:
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <code className="text-sm text-gray-800 break-all">
                      {selectedElement.currentValue}
                    </code>
                  </div>
                </div>

                {/* Edit Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Novo Valor:
                  </label>
                  {selectedElement.type === 'text' || selectedElement.type === 'button' ? (
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                      rows={4}
                      placeholder="Digite o novo texto..."
                    />
                  ) : (
                    <input
                      type={selectedElement.type === 'image' ? 'url' : 'text'}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={
                        selectedElement.type === 'image' 
                          ? 'Cole a URL da nova imagem...' 
                          : selectedElement.type === 'link'
                          ? 'Cole a nova URL do link...'
                          : 'Digite o novo valor...'
                      }
                    />
                  )}
                </div>

                {/* Preview */}
                {editValue && editValue !== selectedElement.currentValue && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview:
                    </label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      {selectedElement.type === 'image' ? (
                        <img 
                          src={editValue} 
                          alt="Preview" 
                          className="max-w-full h-auto max-h-32 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjEycHgiIGZpbGw9IiM5OTk5OTkiPkVycm8gYW8gY2FycmVnYXI8L3RleHQ+PC9zdmc+';
                          }}
                        />
                      ) : (
                        <div className="text-sm text-gray-800 break-all">
                          {editValue}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={cancelEdit}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                
                <button
                  onClick={saveEdit}
                  disabled={!editValue || editValue === selectedElement.currentValue}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Salvar Alteração
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Elements List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            📋 Elementos Editáveis ({editableElements.length})
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Clique no lápis para editar qualquer elemento da página
          </p>
        </div>

        <div className="p-6">
          {editableElements.length === 0 ? (
            <div className="text-center py-12">
              <Edit className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                Nenhum elemento editável encontrado
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Clique em "Reescanear" para buscar elementos na página
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {editableElements.map((element) => {
                const hasChanges = changes.has(element.id);
                const displayValue = changes.get(element.id) || element.currentValue;
                
                return (
                  <div
                    key={element.id}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      hasChanges 
                        ? 'border-yellow-300 bg-yellow-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-1 rounded border ${getElementColor(element.type)}`}>
                            {getElementIcon(element.type)}
                          </div>
                          <span className="font-medium text-gray-900 text-sm">
                            {element.label}
                          </span>
                          {hasChanges && (
                            <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">
                              Modificado
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <code className="bg-gray-100 px-1 rounded text-xs">
                            {element.selector}
                          </code>
                        </div>
                        
                        <div className="text-sm text-gray-800">
                          {element.type === 'image' ? (
                            <div className="flex items-center gap-3">
                              <img 
                                src={displayValue} 
                                alt="Current" 
                                className="w-16 h-16 object-cover rounded border border-gray-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZjdmN2Y3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iOHB4IiBmaWxsPSIjOTk5OTk5Ij5FcnJvPC90ZXh0Pjwvc3ZnPg==';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 break-all">
                                  {displayValue}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="break-all line-clamp-2">
                              {displayValue.length > 100 
                                ? `${displayValue.substring(0, 100)}...` 
                                : displayValue
                              }
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => startEditing(element)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors flex-shrink-0"
                        title="Editar elemento"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 Como Usar o Editor:</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>• <strong>1. Reescanear:</strong> Clique em "Reescanear" para encontrar todos os elementos editáveis</p>
          <p>• <strong>2. Editar:</strong> Clique no lápis (✏️) ao lado do elemento que deseja modificar</p>
          <p>• <strong>3. Modificar:</strong> Digite o novo conteúdo no modal de edição</p>
          <p>• <strong>4. Preview:</strong> Use "Preview Changes" para ver as alterações antes de aplicar</p>
          <p>• <strong>5. Aplicar:</strong> Clique em "Aplicar Todas as Alterações" para salvar</p>
          <p>• <strong>6. Reverter:</strong> Recarregue a página para desfazer todas as alterações</p>
        </div>
        
        <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">⚠️ Importante:</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <p>• As alterações são aplicadas apenas visualmente (DOM)</p>
            <p>• Para salvar permanentemente, você precisa atualizar o código fonte</p>
            <p>• Use este editor para testar mudanças rapidamente</p>
            <p>• Recarregar a página desfaz todas as alterações</p>
          </div>
        </div>
      </div>
    </div>
  );
};