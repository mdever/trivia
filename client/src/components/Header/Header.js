

const headerStyles = {
    'position': 'relative',
    'min-height': '100px'
};

const h3Styles = {
    'position': 'absolute',
    'top': '40%',
    'left': '50%'
};


export default function Header() {
    return (
        <header style={headerStyles}>
            <h3 style={h3Styles}>Trivia</h3>
        </header>
    );
  }