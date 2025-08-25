import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, RefreshCw, Play, Edit3, Eye, AlertTriangle } from 'lucide-react';

interface FactoryVideo {
  id: string;
  title: string;
  description: string;
  video_id: string;
  order_index: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const FactoryVideoEditor: React.FC = () => {
  const [videos, setVideos] = useState<FactoryVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load videos from database
  const loadVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('factory_videos')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setVideos(data);
      } else {
        // Initialize with default videos if none exist
        const defaultVideos: FactoryVideo[] = [
          {
            id: '1',
            title: 'State-of-the-Art Manufacturing',
            description: 'Our FDA-registered facility uses cutting-edge technology to ensure every bottle meets pharmaceutical-grade standards.',
            video_id: 'factory_video_1',
            order_index: 1,
            active: true
          },
          {
            id: '2',
            title: 'Rigorous Quality Control',
            description: 'Every batch undergoes extensive testing for purity, potency, and safety before reaching your doorstep.',
            video_id: 'factory_video_2',
            order_index: 2,
            active: true
          },
          {
            id: '3',
            title: 'Premium Ingredient Sourcing',
            description: 'We source only the highest-grade natural ingredients from trusted suppliers worldwide.',
            video_id: 'factory_video_3',
            order_index: 3,
            active: true
          }
        ];
        setVideos(defaultVideos);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading factory videos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save videos to database
  const saveVideos = async () => {
    setSaving(true);
    try {
      // Delete existing videos
      await supabase.from('factory_videos').delete().neq('id', '');

      // Insert updated videos
      const { error } = await supabase
        .from('factory_videos')
        .insert(videos.map(video => ({
          ...video,
          updated_at: new Date().toISOString()
        })));

      if (error) throw error;

      console.log('✅ Factory videos saved successfully');
      setLastUpdated(new Date());
      setEditingIndex(null);
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      `;
      successDiv.textContent = '✅ Vídeos da fábrica salvos com sucesso!';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error saving factory videos:', error);
      
      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      `;
      errorDiv.textContent = '❌ Erro ao salvar vídeos da fábrica';
      document.body.appendChild(errorDiv);
      
      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          document.body.removeChild(errorDiv);
        }
      }, 3000);
    } finally {
      setSaving(false);
    }
  };

  // Update video data
  const updateVideo = (index: number, field: keyof FactoryVideo, value: string | boolean | number) => {
    setVideos(prev => prev.map((video, i) => 
      i === index ? { ...video, [field]: value } : video
    ));
  };

  // Preview video in new tab
  const previewVideo = (videoId: string) => {
    const previewUrl = `https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/embed.html`;
    window.open(previewUrl, '_blank', 'width=800,height=600');
  };

  useEffect(() => {
    loadVideos();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              🏭 Editor de Vídeos da Fábrica
            </h3>
            <p className="text-gray-600 mt-1">
              Edite os vídeos, títulos e descrições da seção da fábrica
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={loadVideos}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Recarregar
            </button>
            
            <button
              onClick={saveVideos}
              disabled={saving || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-800">Como usar:</span>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Edite os campos abaixo para personalizar cada vídeo da fábrica</li>
            <li>• <strong>Video ID:</strong> ID do vídeo VTurb (ex: 686778a578c1d68a67597d8c)</li>
            <li>• <strong>Título:</strong> Nome da etapa do processo de fabricação</li>
            <li>• <strong>Descrição:</strong> Explicação breve do que o vídeo mostra</li>
            <li>• Clique em "Salvar Alterações" para aplicar na página principal</li>
          </ul>
        </div>

        {/* Last Updated */}
        <div className="mt-4 text-center text-sm text-gray-500">
          📅 Última atualização: {lastUpdated.toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Video Editor */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Carregando vídeos da fábrica...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                {/* Video Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Vídeo {index + 1} da Fábrica
                      </h4>
                      <p className="text-sm text-gray-600">
                        Ordem: {video.order_index} • Status: {video.active ? '✅ Ativo' : '❌ Inativo'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => previewVideo(video.video_id)}
                      disabled={!video.video_id || video.video_id.includes('factory_video')}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Preview do vídeo"
                    >
                      <Play className="w-3 h-3" />
                      Preview
                    </button>
                    
                    <button
                      onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 transition-colors text-sm"
                    >
                      {editingIndex === index ? <Eye className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                      {editingIndex === index ? 'Visualizar' : 'Editar'}
                    </button>
                  </div>
                </div>

                {/* Video Fields */}
                {editingIndex === index ? (
                  <div className="space-y-4">
                    {/* Video ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🎬 Video ID (VTurb):
                      </label>
                      <input
                        type="text"
                        value={video.video_id}
                        onChange={(e) => updateVideo(index, 'video_id', e.target.value)}
                        placeholder="Ex: 686778a578c1d68a67597d8c"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ID do vídeo VTurb (encontre no painel da ConverteAI)
                      </p>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📝 Título:
                      </label>
                      <input
                        type="text"
                        value={video.title}
                        onChange={(e) => updateVideo(index, 'title', e.target.value)}
                        placeholder="Ex: State-of-the-Art Manufacturing"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📄 Descrição:
                      </label>
                      <textarea
                        value={video.description}
                        onChange={(e) => updateVideo(index, 'description', e.target.value)}
                        placeholder="Ex: Our FDA-registered facility uses cutting-edge technology..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Order and Active Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🔢 Ordem:
                        </label>
                        <input
                          type="number"
                          value={video.order_index}
                          onChange={(e) => updateVideo(index, 'order_index', parseInt(e.target.value) || 1)}
                          min="1"
                          max="10"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ⚡ Status:
                        </label>
                        <select
                          value={video.active ? 'true' : 'false'}
                          onChange={(e) => updateVideo(index, 'active', e.target.value === 'true')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="true">✅ Ativo</option>
                          <option value="false">❌ Inativo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Preview Mode */
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2">📝 Título:</h5>
                          <p className="text-gray-700 bg-white p-3 rounded border">
                            {video.title || 'Sem título'}
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2">🎬 Video ID:</h5>
                          <p className="text-gray-700 bg-white p-3 rounded border font-mono text-sm">
                            {video.video_id || 'Não definido'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h5 className="font-semibold text-gray-900 mb-2">📄 Descrição:</h5>
                        <p className="text-gray-700 bg-white p-3 rounded border leading-relaxed">
                          {video.description || 'Sem descrição'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {!loading && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              📊 Total: {videos.length} vídeos • Ativos: {videos.filter(v => v.active).length}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  // Add new video
                  const newVideo: FactoryVideo = {
                    id: Date.now().toString(),
                    title: 'Novo Vídeo da Fábrica',
                    description: 'Descrição do novo vídeo...',
                    video_id: 'novo_video_id',
                    order_index: videos.length + 1,
                    active: true
                  };
                  setVideos(prev => [...prev, newVideo]);
                  setEditingIndex(videos.length);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
              >
                <Play className="w-4 h-4" />
                Adicionar Vídeo
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 Instruções:</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• <strong>Video ID:</strong> Copie o ID do vídeo VTurb do painel da ConverteAI</p>
            <p>• <strong>Título:</strong> Nome da etapa do processo (ex: "Controle de Qualidade")</p>
            <p>• <strong>Descrição:</strong> Explicação breve do que o vídeo mostra</p>
            <p>• <strong>Ordem:</strong> Define a sequência dos vídeos no slideshow</p>
            <p>• <strong>Preview:</strong> Abre o vídeo em nova aba para testar</p>
            <p>• <strong>Salvar:</strong> Aplica as alterações na página principal imediatamente</p>
          </div>
        </div>
      </div>
    </div>
  );
};