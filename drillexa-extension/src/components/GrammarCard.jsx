import { IoMdClose } from "react-icons/io";
import { FaPuzzlePiece } from "react-icons/fa";

function GrammarCard({ grammarData, onClose }) {
  if (!grammarData) return null;

  return (
    <div className="ElementCardOverlay">
      <div className="ElementCardContainer" style={{ maxWidth: '600px' }}>
        
        {/* Header */}
        <div className="EC-Header" style={{ borderBottom: '2px solid #a78bfa' }}>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                 <button className="EC-CloseBtn" onClick={onClose}>
                    <IoMdClose />
                 </button>
              <h3 className="EC-Title" style={{ fontSize: '1.1rem' }}>
                <FaPuzzlePiece style={{ marginRight: '8px', color: '#a78bfa' }}/> 
                Grammar Analysis
              </h3>
            </div>
        </div>

        <div className="EC-Content">
            {/* Frase Original */}
            <div style={{ 
                padding: '15px', 
                background: 'rgba(255,255,255,0.05)', 
                borderRadius: '8px',
                fontStyle: 'italic',
                fontSize: '1.1rem',
                textAlign: 'center',
                marginBottom: '15px',
                border: '1px solid #444'
            }}>
                "{grammarData.original}"
            </div>

            {/* Explicación General */}
            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#a78bfa', margin: '0 0 5px 0' }}>Structure:</h4>
                <p style={{ margin: 0, lineHeight: '1.5' }}>{grammarData.general_explanation}</p>
            </div>

            {/* Breakdown (Chips) */}
            <div className="EC-Examples">
                <h4 style={{ borderBottom: '1px solid #444', paddingBottom: '5px' }}>Breakdown:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {grammarData.breakdown.map((item, i) => (
                        <div key={i} style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            background: '#222', 
                            padding: '10px', 
                            borderRadius: '6px',
                            borderLeft: `4px solid ${['#a78bfa', '#00c3ff', '#ff0055'][i % 3]}` // Colores rotativos
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                <span style={{ fontWeight: 'bold', color: '#fff' }}>"{item.segment}"</span>
                                <span style={{ fontSize: '0.8rem', background: '#333', padding: '2px 6px', borderRadius: '4px', color: '#ccc' }}>
                                    {item.role}
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>{item.explanation}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default GrammarCard;