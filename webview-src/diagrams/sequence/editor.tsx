import React from 'react';
import { EditorProps } from '../types';
import { SequenceDiagramModel, Participant, Message } from './handler';

interface SequenceDiagramEditorState {
  activeTab: 'participants' | 'messages' | 'notes';
}

/**
 * 序列图表单编辑器组件
 * 提供基于表单的编辑界面
 */
export const SequenceDiagramEditor: React.FC<EditorProps<SequenceDiagramModel>> = ({ model, onChange }) => {
  const [state, setState] = React.useState<SequenceDiagramEditorState>({
    activeTab: 'participants',
  });

  // 添加参与者
  const addParticipant = () => {
    const newParticipant: Participant = {
      id: `participant-${Date.now()}`,
      name: `Participant${model.participants.length + 1}`,
      alias: '',
    };
    onChange({
      ...model,
      participants: [...model.participants, newParticipant],
    });
  };

  // 删除参与者
  const deleteParticipant = (participantId: string) => {
    onChange({
      ...model,
      participants: model.participants.filter((p: Participant) => p.id !== participantId),
      messages: model.messages.filter(
        (m: Message) => m.from !== participantId && m.to !== participantId
      ),
    });
  };

  // 更新参与者
  const updateParticipant = (participantId: string, updates: Partial<Participant>) => {
    onChange({
      ...model,
      participants: model.participants.map((p: Participant) =>
        p.id === participantId ? { ...p, ...updates } : p
      ),
    });
  };

  // 添加消息
  const addMessage = () => {
    if (model.participants.length < 2) {
      alert('需要至少两个参与者才能创建消息');
      return;
    }
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      from: model.participants[0].id,
      to: model.participants[1].id,
      message: 'Message',
      type: 'solid',
    };
    onChange({
      ...model,
      messages: [...model.messages, newMessage],
    });
  };

  // 删除消息
  const deleteMessage = (messageId: string) => {
    onChange({
      ...model,
      messages: model.messages.filter((m: Message) => m.id !== messageId),
    });
  };

  // 更新消息
  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    onChange({
      ...model,
      messages: model.messages.map((m: Message) =>
        m.id === messageId ? { ...m, ...updates } : m
      ),
    });
  };

  // 添加注释
  const addNote = () => {
    const newNote = {
      text: 'Note text',
      over: model.participants.length > 0 ? [model.participants[0].name] : [],
    };
    onChange({
      ...model,
      notes: [...(model.notes || []), newNote],
    });
  };

  // 删除注释
  const deleteNote = (index: number) => {
    onChange({
      ...model,
      notes: (model.notes || []).filter((_, i) => i !== index),
    });
  };

  // 更新注释
  const updateNote = (index: number, updates: Partial<{ text: string; over: string[] }>) => {
    const newNotes = [...(model.notes || [])];
    newNotes[index] = { ...newNotes[index], ...updates };
    onChange({
      ...model,
      notes: newNotes,
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
    messageRow: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '10px',
      gap: '10px',
      flexWrap: 'wrap' as const,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>Sequence Diagram Editor</h2>
        <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.7 }}>
          Participants: {model.participants.length} | Messages: {model.messages.length} | Notes: {(model.notes || []).length}
        </p>
      </div>

      {/* 标签页切换 */}
      <div style={styles.tabs}>
        <button
          style={styles.tab(state.activeTab === 'participants')}
          onClick={() => setState({ ...state, activeTab: 'participants' })}
        >
          Participants
        </button>
        <button
          style={styles.tab(state.activeTab === 'messages')}
          onClick={() => setState({ ...state, activeTab: 'messages' })}
        >
          Messages
        </button>
        <button
          style={styles.tab(state.activeTab === 'notes')}
          onClick={() => setState({ ...state, activeTab: 'notes' })}
        >
          Notes
        </button>
      </div>

      {/* 参与者管理 */}
      {state.activeTab === 'participants' && (
        <div>
          <div style={styles.section}>
            <button style={styles.button} onClick={addParticipant}>
              + Add Participant
            </button>
          </div>

          {model.participants.map(participant => (
            <div key={participant.id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                  <input
                    style={{ ...styles.input, flex: 1 }}
                    value={participant.name}
                    onChange={(e) => updateParticipant(participant.id, { name: e.target.value })}
                    placeholder="ID"
                  />
                  <input
                    style={{ ...styles.input, flex: 1 }}
                    value={participant.alias || ''}
                    onChange={(e) => updateParticipant(participant.id, { alias: e.target.value })}
                    placeholder="Alias (optional)"
                  />
                </div>
                <button
                  style={styles.dangerButton}
                  onClick={() => deleteParticipant(participant.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {model.participants.length === 0 && (
            <p style={{ textAlign: 'center', opacity: 0.5 }}>
              No participants yet. Click "Add Participant" to create one.
            </p>
          )}
        </div>
      )}

      {/* 消息管理 */}
      {state.activeTab === 'messages' && (
        <div>
          <div style={styles.section}>
            <button style={styles.button} onClick={addMessage}>
              + Add Message
            </button>
          </div>

          {model.messages.map(message => (
            <div key={message.id} style={styles.card}>
              <div style={styles.messageRow}>
                <select
                  style={styles.select}
                  value={message.from}
                  onChange={(e) => updateMessage(message.id, { from: e.target.value })}
                >
                  {model.participants.map(p => (
                    <option key={p.id} style={styles.option} value={p.id}>{p.name}{p.alias ? ` (${p.alias})` : ''}</option>
                  ))}
                </select>

                <select
                  style={styles.select}
                  value={message.type}
                  onChange={(e) => updateMessage(message.id, { type: e.target.value as 'solid' | 'dashed' })}
                >
                  <option style={styles.option} value="solid">→ (Solid)</option>
                  <option style={styles.option} value="dashed">--› (Dashed)</option>
                </select>

                <select
                  style={styles.select}
                  value={message.to}
                  onChange={(e) => updateMessage(message.id, { to: e.target.value })}
                >
                  {model.participants.map(p => (
                    <option key={p.id} style={styles.option} value={p.id}>{p.name}{p.alias ? ` (${p.alias})` : ''}</option>
                  ))}
                </select>

                <button
                  style={styles.dangerButton}
                  onClick={() => deleteMessage(message.id)}
                >
                  Delete
                </button>
              </div>

              <input
                style={{ ...styles.input, width: '100%' }}
                value={message.message}
                onChange={(e) => updateMessage(message.id, { message: e.target.value })}
                placeholder="Message text"
              />
            </div>
          ))}

          {model.messages.length === 0 && (
            <p style={{ textAlign: 'center', opacity: 0.5 }}>
              No messages yet. Click "Add Message" to create one.
            </p>
          )}
        </div>
      )}

      {/* 注释管理 */}
      {state.activeTab === 'notes' && (
        <div>
          <div style={styles.section}>
            <button style={styles.button} onClick={addNote}>
              + Add Note
            </button>
          </div>

          {(model.notes || []).map((note, index) => (
            <div key={index} style={styles.card}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
                  Note over:
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {model.participants.map(p => (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <input
                        type="checkbox"
                        checked={note.over.includes(p.name)}
                        onChange={(e) => {
                          const newOver = e.target.checked
                            ? [...note.over, p.name]
                            : note.over.filter(n => n !== p.name);
                          updateNote(index, { over: newOver });
                        }}
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  style={{ ...styles.input, flex: 1 }}
                  value={note.text}
                  onChange={(e) => updateNote(index, { text: e.target.value })}
                  placeholder="Note text"
                />
                <button
                  style={styles.dangerButton}
                  onClick={() => deleteNote(index)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {(!model.notes || model.notes.length === 0) && (
            <p style={{ textAlign: 'center', opacity: 0.5 }}>
              No notes yet. Click "Add Note" to create one.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
