# Mermaid Visual Editor for VSCode

A Visual Studio Code extension that provides a visual drag-and-drop editor for Mermaid (.mmd) files with interactive diagram editing capabilities.

**Inspired by**: [Mermaid Visual Editor](https://github.com/saketkattu/mermaid-visual-editor) - A standalone web-based visual editor for Mermaid.js flowcharts.

## Features

- 🎨 **Visual Drag-and-Drop Editor**: Create and edit Mermaid diagrams using an intuitive visual canvas with drag-and-drop interactions
- 👁️ **Live Preview**: Real-time rendering of Mermaid diagrams as you build them visually
- 🌓 **Full VSCode Theme Support**: Automatically adapts to your VSCode theme (light/dark/high contrast)
- 🔗 **Interactive Canvas**: Infinite canvas with pan, zoom, and node connection handles
- 📐 **Auto Layout**: Automatically arrange nodes using the Dagre layout algorithm
- 💡 **Multiple Node Shapes**: Support for various node shapes (rectangle, rounded, stadium, diamond, circle, hexagon, cylinder, etc.)
- 🎯 **Edge Customization**: Different edge types (solid, dashed, thick) with arrow support
- 📤 **Export Options**: Export diagrams as .mmd files or copy Mermaid syntax to clipboard
- 🔄 **Bi-directional Sync**: Changes in the visual editor update the document and vice versa
- ⌨️ **Keyboard Shortcuts**: 
  - `N` - Add new node
  - `Delete/Backspace` - Delete selected nodes/edges
  - Double-click canvas - Add node
  - Double-click node - Edit label

## Supported Diagram Types

Currently focused on **flowcharts** with more diagram types planned:
- Flowcharts (✅ Supported)
- Sequence diagrams (🔜 Coming soon)
- Class diagrams (🔜 Coming soon)
- State diagrams (🔜 Coming soon)
- Entity Relationship diagrams (🔜 Coming soon)
- And more...

## Usage

1. **Open a Mermaid File**
   - Open any `.mmd` or `.mermaid` file in VSCode
   - The visual editor will automatically open with split view

2. **Theme Support** 🌓
   - The editor automatically adapts to your VSCode theme
   - Switch themes with `Ctrl+K Ctrl+T` (Mac: `Cmd+K Cmd+T`)
   - Supports light, dark, and high contrast themes
   - Mermaid diagrams use appropriate theme (default/dark) based on VSCode theme
   - See [THEME_SUPPORT.md](./THEME_SUPPORT.md) for details

3. **Create Nodes**
   - Click "+ Add Node" button in the toolbar
   - Press `N` key
   - Double-click anywhere on the canvas

4. **Connect Nodes**
   - Drag from the handle (top/bottom/left/right) of one node to another
   - Edges are created automatically

5. **Edit Nodes**
   - Double-click a node to edit its label inline
   - Drag nodes to reposition them

6. **Customize Appearance**
   - Select nodes to change shape and style (coming soon)
   - Customize edge types and labels (coming soon)

7. **Auto Layout**
   - Click "Auto Layout" to automatically arrange nodes
   - Choose direction: Top-to-Bottom, Left-to-Right, etc. (coming soon)

8. **Export**
   - Click "Copy Syntax" to copy Mermaid code to clipboard
   - Click "Export .mmd" to download as .mmd file
   - Toggle preview panel to see generated syntax

## Commands

- `Mermaid: Open Mermaid Visual Editor` - Open the visual editor for the current file
- `Mermaid: Toggle Preview` - Toggle the preview panel

## Requirements

- VSCode 1.85.0 or higher

## Extension Settings

This extension contributes:

- Custom editor for `.mmd` and `.mermaid` files
- Language support for Mermaid syntax
- Toolbar integration

## Technology Stack

This VSCode extension is built with:
- **React** - UI framework
- **React Flow (@xyflow/react)** - Interactive graph/canvas library
- **Zustand** - State management
- **Dagre** - Graph layout algorithm
- **Mermaid.js** - Diagram rendering engine
- **TypeScript** - Type safety
- **Webpack** - Module bundling

## Known Issues

- Import of existing complex Mermaid diagrams is still being improved
- Some advanced Mermaid features (subgraphs, special styling) are not yet supported
- Parser for complex Mermaid syntax is simplified

Please report any issues on our GitHub repository.

## Roadmap

### Near-term
- ✅ Visual drag-and-drop editor (Implemented)
- ✅ Auto layout with Dagre (Implemented)
- ✅ Multiple node shapes (Implemented)
- Improved Mermaid syntax parser for importing complex diagrams
- Subgraph support
- More customization options for nodes and edges

### Medium-term
- Sequence diagram support
- Class diagram support
- State diagram support
- ER diagram support
- Theme selector for the editor UI
- Dark mode support

### Long-term
- AI-assisted diagram generation
- Two-way code-canvas sync improvements
- Real-time collaboration features

## Release Notes

### 0.0.1

- Initial release
- Visual drag-and-drop editor for flowcharts
- Live preview with Mermaid syntax generation
- Auto layout functionality
- Export to .mmd and copy syntax features
- Keyboard shortcuts support
- Multiple node shapes support

## License

MIT

## Acknowledgments

This project is heavily inspired by and based on the excellent work of:

- **[Mermaid Visual Editor](https://github.com/saketkattu/mermaid-visual-editor)** by Saket Kattu
  - Original concept and implementation of visual drag-and-drop Mermaid editor
  - Architecture patterns for canvas state management and Mermaid serialization
  - This VSCode extension adapts and extends that work for the VSCode ecosystem

Special thanks to the creators and contributors of:
- [Mermaid.js](https://mermaid.js.org/)
- [React Flow](https://reactflow.dev/)
- [Dagre](https://github.com/dagrejs/dagre)

---

**Note**: This is a VSCode extension adaptation of the standalone Mermaid Visual Editor web application. All core concepts and implementation patterns are derived from the original project.
