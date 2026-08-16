import { useState, useEffect, useRef } from 'react';

const GRAPH_NODES = [
  { id: 'user', label: 'You', type: 'self', x: 50, y: 50, size: 48 },
  { id: 'python', label: 'Python', type: 'skill', x: 25, y: 30, size: 32 },
  { id: 'react', label: 'React', type: 'skill', x: 75, y: 25, size: 32 },
  { id: 'ml', label: 'Machine Learning', type: 'skill', x: 20, y: 60, size: 28 },
  { id: 'healthcare', label: 'Healthcare', type: 'interest', x: 80, y: 60, size: 28 },
  { id: 'startup', label: 'Startups', type: 'interest', x: 15, y: 80, size: 26 },
  { id: 'project1', label: 'AI Diagnosis', type: 'project', x: 65, y: 80, size: 30 },
  { id: 'conn1', label: 'Dr. Aisha', type: 'connection', x: 40, y: 15, size: 26 },
  { id: 'conn2', label: 'James O.', type: 'connection', x: 60, y: 15, size: 26 },
];

const GRAPH_EDGES = [
  { from: 'user', to: 'python' },
  { from: 'user', to: 'react' },
  { from: 'user', to: 'ml' },
  { from: 'user', to: 'healthcare' },
  { from: 'user', to: 'startup' },
  { from: 'user', to: 'project1' },
  { from: 'user', to: 'conn1' },
  { from: 'user', to: 'conn2' },
  { from: 'python', to: 'ml' },
  { from: 'ml', to: 'healthcare' },
  { from: 'ml', to: 'project1' },
  { from: 'conn1', to: 'healthcare' },
  { from: 'conn1', to: 'ml' },
  { from: 'conn2', to: 'react' },
  { from: 'startup', to: 'project1' },
];

const NODE_COLORS = {
  self: 'var(--primary)',
  skill: '#3b82f6',
  interest: '#f59e0b',
  project: '#8b5cf6',
  connection: '#22c55e',
};

export default function ProfessionalGraph({ user }) {
  const canvasRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: 400 });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;

    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    ctx.clearRect(0, 0, width, height);

    const nodes = GRAPH_NODES.map(n => ({
      ...n,
      px: (n.x / 100) * width,
      py: (n.y / 100) * height,
    }));

    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    GRAPH_EDGES.forEach(edge => {
      const from = nodeMap[edge.from];
      const to = nodeMap[edge.to];
      if (!from || !to) return;

      ctx.beginPath();
      ctx.moveTo(from.px, from.py);
      ctx.lineTo(to.px, to.py);
      ctx.strokeStyle = hoveredNode && (edge.from === hoveredNode || edge.to === hoveredNode)
        ? 'rgba(74,108,247,0.6)'
        : 'rgba(0,0,0,0.08)';
      ctx.lineWidth = hoveredNode && (edge.from === hoveredNode || edge.to === hoveredNode) ? 2 : 1;
      ctx.stroke();
    });

    nodes.forEach(node => {
      const isHovered = hoveredNode === node.id;
      const isSelected = selectedNode === node.id;
      const radius = node.size / 2 + (isHovered || isSelected ? 4 : 0);

      ctx.beginPath();
      ctx.arc(node.px, node.py, radius, 0, Math.PI * 2);
      ctx.fillStyle = NODE_COLORS[node.type];
      ctx.globalAlpha = isHovered || isSelected ? 1 : 0.85;
      ctx.fill();

      if (isHovered || isSelected) {
        ctx.beginPath();
        ctx.arc(node.px, node.py, radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = NODE_COLORS[node.type];
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.font = `${node.type === 'self' ? 'bold 12px' : '10px'} -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const label = node.label.length > 10 ? node.label.substring(0, 8) + '...' : node.label;
      ctx.fillText(label, node.px, node.py);
    });
  }, [hoveredNode, selectedNode, dimensions]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const nodes = GRAPH_NODES.map(n => ({
      ...n,
      px: (n.x / 100) * dimensions.width,
      py: (n.y / 100) * dimensions.height,
    }));

    let found = null;
    for (const node of nodes) {
      const dist = Math.sqrt((x - node.px) ** 2 + (y - node.py) ** 2);
      if (dist < node.size / 2 + 8) {
        found = node.id;
        break;
      }
    }
    setHoveredNode(found);
  };

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const nodes = GRAPH_NODES.map(n => ({
      ...n,
      px: (n.x / 100) * dimensions.width,
      py: (n.y / 100) * dimensions.height,
    }));

    let found = null;
    for (const node of nodes) {
      const dist = Math.sqrt((x - node.px) ** 2 + (y - node.py) ** 2);
      if (dist < node.size / 2 + 8) {
        found = node.id;
        break;
      }
    }
    setSelectedNode(found === selectedNode ? null : found);
  };

  const hoveredNodeData = GRAPH_NODES.find(n => n.id === hoveredNode);

  return (
    <div className="prof-graph card" ref={containerRef}>
      <div className="graph-header">
        <h3>Professional Graph</h3>
        <div className="graph-legend">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <span key={type} className="legend-item">
              <span className="legend-dot" style={{ background: color }} />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          ))}
        </div>
      </div>

      <div className="graph-canvas-wrap">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: 400, cursor: hoveredNode ? 'pointer' : 'default' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={handleClick}
        />
        {hoveredNodeData && (
          <div className="graph-tooltip">
            <strong>{hoveredNodeData.label}</strong>
            <span>{hoveredNodeData.type}</span>
          </div>
        )}
      </div>

      <div className="graph-stats">
        <div className="graph-stat">
          <span className="stat-value">{GRAPH_NODES.filter(n => n.type === 'skill').length}</span>
          <span className="stat-label">Skills</span>
        </div>
        <div className="graph-stat">
          <span className="stat-value">{GRAPH_NODES.filter(n => n.type === 'connection').length}</span>
          <span className="stat-label">Connections</span>
        </div>
        <div className="graph-stat">
          <span className="stat-value">{GRAPH_NODES.filter(n => n.type === 'project').length}</span>
          <span className="stat-label">Projects</span>
        </div>
        <div className="graph-stat">
          <span className="stat-value">{GRAPH_NODES.filter(n => n.type === 'interest').length}</span>
          <span className="stat-label">Interests</span>
        </div>
      </div>

      <style>{`
        .prof-graph { padding: 20px; }
        .graph-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .graph-header h3 { font-size: 16px; }
        .graph-legend { display: flex; gap: 12px; }
        .legend-item { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-light); }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
        .graph-canvas-wrap { position: relative; }
        .graph-tooltip { position: absolute; top: 10px; right: 10px; padding: 8px 12px; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-md); }
        .graph-tooltip strong { display: block; font-size: 13px; }
        .graph-tooltip span { font-size: 11px; color: var(--text-light); text-transform: capitalize; }
        .graph-stats { display: flex; justify-content: space-around; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
        .graph-stat { text-align: center; }
        .stat-value { display: block; font-size: 20px; font-weight: 700; color: var(--primary); }
        .stat-label { font-size: 12px; color: var(--text-light); }
      `}</style>
    </div>
  );
}
