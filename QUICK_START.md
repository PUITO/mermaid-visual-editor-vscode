# Quick Start Guide - Mermaid Visual Editor

## Getting Started in 3 Steps

### 1. Build the Extension
```bash
npm install
npm run compile
```

### 2. Run in Debug Mode
- Press `F5` in VSCode (or go to Run → Start Debugging)
- A new VSCode window will open with the extension loaded

### 3. Try the Visual Editor
- Open `example-flowchart.mmd` from the project folder
- The visual editor will automatically open
- You'll see:
  - **Left side**: Interactive canvas with nodes and edges
  - **Right side**: Generated Mermaid syntax preview

## Using the Visual Editor

### Creating Nodes
1. **Method 1**: Click the "+ Add Node" button in the toolbar
2. **Method 2**: Press the `N` key anywhere on the canvas
3. **Method 3**: Double-click anywhere on the canvas to add a node at that position

### Connecting Nodes
1. Hover over any node to see connection handles (small dots)
2. Click and drag from a handle (top, bottom, left, or right)
3. Drop on another node's handle to create a connection
4. The edge is created automatically!

### Editing Nodes
- **Double-click** any node to edit its label inline
- Type your text and press Enter or click outside to save
- **Drag** nodes to reposition them on the canvas

### Deleting
- Select a node or edge by clicking it
- Press `Delete` or `Backspace` to remove it

### Auto Layout
- Click the "Auto Layout" button in the toolbar
- Nodes will be automatically arranged using the Dagre algorithm
- This helps organize complex diagrams

### Exporting Your Diagram

#### Copy Mermaid Syntax
1. Click "Copy Syntax" button
2. Paste anywhere (Ctrl+V)

#### Download as .mmd File
1. Click "Export .mmd" button
2. File will download as `diagram.mmd`
3. Save it to your desired location

#### Toggle Preview Panel
- Click "Show/Hide Preview" to toggle the Mermaid syntax panel
- Useful for seeing the generated code in real-time

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N` | Add new node |
| `Delete` / `Backspace` | Delete selected nodes/edges |
| `Double-click canvas` | Add node at position |
| `Double-click node` | Edit node label |
| `Ctrl + Z` | Undo (coming soon) |
| `Ctrl + Y` | Redo (coming soon) |

## Tips & Tricks

### 💡 Tip 1: Start Simple
Begin with a few nodes and gradually build complexity. The visual editor makes it easy to add and rearrange nodes.

### 💡 Tip 2: Use Auto Layout
After creating your diagram structure, use Auto Layout to get a clean arrangement, then fine-tune positions manually if needed.

### 💡 Tip 3: Canvas Navigation
- **Pan**: Click and drag on empty canvas space
- **Zoom**: Use mouse wheel or pinch gesture
- **Fit View**: The diagram automatically fits in view

### 💡 Tip 4: Real-time Feedback
Watch the preview panel update in real-time as you modify the diagram visually. This helps you understand the generated Mermaid syntax.

### 💡 Tip 5: Bi-directional Editing
You can:
- Edit visually → Mermaid syntax updates automatically
- Edit the .mmd file in text editor → Visual canvas updates (when reopened)

## Example Workflow

Let's create a simple flowchart:

1. **Open** `example-flowchart.mmd` or create a new `.mmd` file
2. **Add nodes**: Click "+ Add Node" 3 times to create 3 nodes
3. **Rename**: Double-click each node and type: "Start", "Process", "End"
4. **Connect**: Drag from "Start" bottom handle to "Process" top handle
5. **Connect again**: Drag from "Process" to "End"
6. **Auto Layout**: Click "Auto Layout" to arrange nicely
7. **Export**: Click "Export .mmd" to save your diagram

## Troubleshooting

### Editor doesn't open?
- Make sure you've compiled: `npm run compile`
- Check file extension is `.mmd` or `.mermaid`
- Try reopening the file

### Diagram not rendering?
- Check the Developer Console (Help → Toggle Developer Tools)
- Verify Mermaid syntax is valid
- Try the "Refresh" button

### Nodes not connecting?
- Make sure you're dragging from a handle (small dot)
- Drop on another node's handle
- Handles appear when you hover over nodes

## Learn More

- [Mermaid.js Documentation](https://mermaid.js.org/) - Complete Mermaid syntax reference
- [React Flow Docs](https://reactflow.dev/) - Learn about the canvas library
- [Original Project](https://github.com/saketkattu/mermaid-visual-editor) - Inspiration for this editor

---

**Happy Diagramming! 🎨**
