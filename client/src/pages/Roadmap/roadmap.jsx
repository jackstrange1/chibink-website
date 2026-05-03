import './roadmap.css';

const Roadmap = () => {
  return (
    <section className="roadmap">
      <h2 className="roadmap-title">Roadmap</h2>

      <div className="timeline">
        {/* ITEM */}
        <div className="timeline-item left">
          <div className="timeline-card">
            <h3>Phase 1</h3>
            <p>Launch CHIBINK collection and build early community.</p>
          </div>
        </div>

        <div className="timeline-item right">
          <div className="timeline-card">
            <h3>Phase 2</h3>
            <p>Grow community and expand visibility across Web3.</p>
          </div>
        </div>

        <div className="timeline-item left">
          <div className="timeline-card">
            <h3>Phase 3</h3>
            <p>Introduce utilities and future ecosystem features.</p>
          </div>
        </div>

        {/* FINAL */}
        <div className="timeline-item right">
          <div className="timeline-card highlight">
            <h3>???</h3>
            <p>Something big is coming...</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
