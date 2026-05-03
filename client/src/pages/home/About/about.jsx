import './about.css';

const About = () => {
  return (
    <section className="about">
      <div className="about-container">
        {/* LEFT SIDE */}
        <div className="about-left">
          <h2 className="about-title">What is CHIBINK?</h2>

          <p className="about-text">
            CHIBINK is a unique NFT collection of{' '}
            <span>555 adorable chibis</span> built on the{' '}
            <span>INK ecosystem</span>. Each character is crafted with a playful
            yet futuristic identity, designed to bring personality and emotion
            into Web3.
          </p>

          <p className="about-text">
            But CHIBINK is <span>more than just NFTs</span>. Every trait begins
            with
            <span> pen on paper</span> and is brought to life using AI -
            blending
            <span> raw art + technology</span> to create something truly unique.
          </p>

          <p className="about-text highlight">
            ✦ 555 Chibis on INK - coming soon 🐘💜
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="about-right">
          <div className="details-card">
            <h3>Collection Details</h3>

            <div className="details-grid">
              <div>
                <span>Supply</span>
                <p>555</p>
              </div>

              <div>
                <span>Chain</span>
                <p>INK</p>
              </div>

              <div>
                <span>Mint Price</span>
                <p>Free</p>
              </div>

              <div>
                <span>Mint Date</span>
                <p>TBA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
