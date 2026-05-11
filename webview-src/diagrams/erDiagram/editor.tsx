import React from 'react';
import { EditorProps } from '../types';
import { ERDiagramModel, Entity, Attribute, Relationship } from './handler';

interface ERDiagramEditorState {
  activeTab: 'entities' | 'relationships';
  selectedEntity?: string;
}

/**
 * ER 图表单编辑器组件
 * 提供基于表单的编辑界面
 */
export const ERDiagramEditor: React.FC<EditorProps<ERDiagramModel>> = ({ model, onChange }) => {
  const [state, setState] = React.useState<ERDiagramEditorState>({
    activeTab: 'entities',
  });

  // 添加实体
  const addEntity = () => {
    const newEntity: Entity = {
      id: `entity-${Date.now()}`,
      name: `Entity${model.entities.length + 1}`,
      attributes: [],
    };
    onChange({
      ...model,
      entities: [...model.entities, newEntity],
    });
  };

  // 删除实体
  const deleteEntity = (entityId: string) => {
    onChange({
      ...model,
      entities: model.entities.filter((e: Entity) => e.id !== entityId),
      relationships: model.relationships.filter(
        (r: Relationship) => r.sourceEntity !== entityId && r.targetEntity !== entityId
      ),
    });
  };

  // 更新实体名称
  const updateEntityName = (entityId: string, newName: string) => {
    onChange({
      ...model,
      entities: model.entities.map((e: Entity) =>
        e.id === entityId ? { ...e, name: newName } : e
      ),
    });
  };

  // 添加属性
  const addAttribute = (entityId: string) => {
    onChange({
      ...model,
      entities: model.entities.map((e: Entity) => {
        if (e.id === entityId) {
          return {
            ...e,
            attributes: [
              ...e.attributes,
              {
                id: `attr-${Date.now()}`,
                type: 'string',
                name: 'attribute',
              },
            ],
          };
        }
        return e;
      }),
    });
  };

  // 删除属性
  const deleteAttribute = (entityId: string, attrId: string) => {
    onChange({
      ...model,
      entities: model.entities.map((e: Entity) => {
        if (e.id === entityId) {
          return {
            ...e,
            attributes: e.attributes.filter((a: Attribute) => a.id !== attrId),
          };
        }
        return e;
      }),
    });
  };

  // 更新属性
  const updateAttribute = (entityId: string, attrId: string, updates: Partial<Attribute>) => {
    onChange({
      ...model,
      entities: model.entities.map((e: Entity) => {
        if (e.id === entityId) {
          return {
            ...e,
            attributes: e.attributes.map((a: Attribute) =>
              a.id === attrId ? { ...a, ...updates } : a
            ),
          };
        }
        return e;
      }),
    });
  };

  // 添加关系
  const addRelationship = () => {
    if (model.entities.length < 2) {
      alert('需要至少两个实体才能创建关系');
      return;
    }
    const newRel: Relationship = {
      id: `rel-${Date.now()}`,
      sourceEntity: model.entities[0].name,
      targetEntity: model.entities[1].name,
      symbol: '||--|{',
    };
    onChange({
      ...model,
      relationships: [...model.relationships, newRel],
    });
  };

  // 删除关系
  const deleteRelationship = (relId: string) => {
    onChange({
      ...model,
      relationships: model.relationships.filter((r: Relationship) => r.id !== relId),
    });
  };

  // 更新关系
  const updateRelationship = (relId: string, updates: Partial<Relationship>) => {
    onChange({
      ...model,
      relationships: model.relationships.map((r: Relationship) =>
        r.id === relId ? { ...r, ...updates } : r
      ),
    });
  };

  const styles = {
    container: {
      padding: '20px',
      height: '100%',
      overflow: 'auto',
      backgroundColor: 'var(--vscode-editor-background)',
      color: 'var(--vscode-editor-foreground)',
    },
    header: {
      marginBottom: '20px',
      borderBottom: '1px solid var(--vscode-panel-border)',
      paddingBottom: '10px',
    },
    tabs: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
    },
    tab: (active: boolean) => ({
      padding: '8px 16px',
      backgroundColor: active ? 'var(--vscode-button-background)' : 'transparent',
      color: active ? 'var(--vscode-button-foreground)' : 'var(--vscode-editor-foreground)',
      border: '1px solid var(--vscode-button-border)',
      borderRadius: '4px',
      cursor: 'pointer',
    }),
    section: {
      marginBottom: '20px',
    },
    button: {
      padding: '6px 12px',
      backgroundColor: 'var(--vscode-button-background)',
      color: 'var(--vscode-button-foreground)',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginRight: '10px',
    },
    dangerButton: {
      padding: '4px 8px',
      backgroundColor: '#f44336',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    input: {
      padding: '4px 8px',
      backgroundColor: 'var(--vscode-input-background)',
      color: 'var(--vscode-input-foreground)',
      border: '1px solid var(--vscode-input-border)',
      borderRadius: '4px',
      marginRight: '10px',
    },
    select: {
      padding: '4px 8px',
      backgroundColor: 'var(--vscode-input-background)',
      color: 'var(--vscode-input-foreground)',
      border: '1px solid var(--vscode-input-border)',
      borderRadius: '4px',
      marginRight: '10px',
    },
    option: {
      backgroundColor: 'var(--vscode-dropdown-background)',
      color: 'var(--vscode-dropdown-foreground)',
    },
    card: {
      padding: '15px',
      marginBottom: '10px',
      backgroundColor: 'var(--vscode-toolbar-background)',
      border: '1px solid var(--vscode-panel-border)',
      borderRadius: '4px',
    },
    attributeRow: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '5px',
      gap: '10px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>ER Diagram Editor</h2>
        <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.7 }}>
          Entities: {model.entities.length} | Relationships: {model.relationships.length}
        </p>
      </div>

      {/* 标签页切换 */}
      <div style={styles.tabs}>
        <button
          style={styles.tab(state.activeTab === 'entities')}
          onClick={() => setState({ ...state, activeTab: 'entities' })}
        >
          Entities
        </button>
        <button
          style={styles.tab(state.activeTab === 'relationships')}
          onClick={() => setState({ ...state, activeTab: 'relationships' })}
        >
          Relationships
        </button>
      </div>

      {/* 实体管理 */}
      {state.activeTab === 'entities' && (
        <div>
          <div style={styles.section}>
            <button style={styles.button} onClick={addEntity}>
              + Add Entity
            </button>
          </div>

          {model.entities.map(entity => (
            <div key={entity.id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <input
                  style={{ ...styles.input, flex: 1 }}
                  value={entity.name}
                  onChange={(e) => updateEntityName(entity.id, e.target.value)}
                  placeholder="Entity name"
                />
                <button
                  style={styles.dangerButton}
                  onClick={() => deleteEntity(entity.id)}
                >
                  Delete
                </button>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <strong>Attributes:</strong>
              </div>

              {entity.attributes.map(attr => (
                <div key={attr.id} style={styles.attributeRow}>
                  <select
                    style={styles.select}
                    value={attr.type}
                    onChange={(e) => updateAttribute(entity.id, attr.id, { type: e.target.value })}
                  >
                    <option style={styles.option} value="string">string</option>
                    <option style={styles.option} value="int">int</option>
                    <option style={styles.option} value="float">float</option>
                    <option style={styles.option} value="date">date</option>
                    <option style={styles.option} value="boolean">boolean</option>
                  </select>
                  <input
                    style={{ ...styles.input, flex: 1 }}
                    value={attr.name}
                    onChange={(e) => updateAttribute(entity.id, attr.id, { name: e.target.value })}
                    placeholder="Attribute name"
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={attr.isPrimaryKey || false}
                      onChange={(e) => updateAttribute(entity.id, attr.id, { isPrimaryKey: e.target.checked })}
                    />
                    PK
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={attr.isForeignKey || false}
                      onChange={(e) => updateAttribute(entity.id, attr.id, { isForeignKey: e.target.checked })}
                    />
                    FK
                  </label>
                  <button
                    style={styles.dangerButton}
                    onClick={() => deleteAttribute(entity.id, attr.id)}
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                style={{ ...styles.button, marginTop: '10px' }}
                onClick={() => addAttribute(entity.id)}
              >
                + Add Attribute
              </button>
            </div>
          ))}

          {model.entities.length === 0 && (
            <p style={{ textAlign: 'center', opacity: 0.5 }}>
              No entities yet. Click "Add Entity" to create one.
            </p>
          )}
        </div>
      )}

      {/* 关系管理 */}
      {state.activeTab === 'relationships' && (
        <div>
          <div style={styles.section}>
            <button style={styles.button} onClick={addRelationship}>
              + Add Relationship
            </button>
          </div>

          {model.relationships.map(rel => (
            <div key={rel.id} style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <select
                  style={styles.select}
                  value={rel.sourceEntity}
                  onChange={(e) => updateRelationship(rel.id, { sourceEntity: e.target.value })}
                >
                  {model.entities.map(e => (
                    <option key={e.id} style={styles.option} value={e.name}>{e.name}</option>
                  ))}
                </select>

                <select
                  style={styles.select}
                  value={rel.symbol}
                  onChange={(e) => updateRelationship(rel.id, { symbol: e.target.value })}
                >
                  <option style={styles.option} value="||--||">||--|| (One-to-One)</option>
                  <option style={styles.option} value="||--|{">||--|{'{'} (One-to-Many)</option>
                  <option style={styles.option} value="||--o{">||--o{'{'} (One-to-Zero-or-More)</option>
                  <option style={styles.option} value="}|--|{">{'}'}--|{'{'} (Many-to-Many)</option>
                  <option style={styles.option} value="}|--o{">{'}'}--o{'{'} (Many-to-Zero-or-More)</option>
                </select>

                <select
                  style={styles.select}
                  value={rel.targetEntity}
                  onChange={(e) => updateRelationship(rel.id, { targetEntity: e.target.value })}
                >
                  {model.entities.map(e => (
                    <option key={e.id} style={styles.option} value={e.name}>{e.name}</option>
                  ))}
                </select>

                <button
                  style={styles.dangerButton}
                  onClick={() => deleteRelationship(rel.id)}
                >
                  Delete
                </button>
              </div>

              <input
                style={{ ...styles.input, width: '100%' }}
                value={rel.label || ''}
                onChange={(e) => updateRelationship(rel.id, { label: e.target.value })}
                placeholder="Relationship label (optional)"
              />
            </div>
          ))}

          {model.relationships.length === 0 && (
            <p style={{ textAlign: 'center', opacity: 0.5 }}>
              No relationships yet. Click "Add Relationship" to create one.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
