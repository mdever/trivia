const headerStyle = {
    paddingTop: '2rem',
    paddingBottom: '1rem'
}

export default function Header() {
    return (
        <header style={headerStyle}>
            <div className="row">
                <div className="col-sm">
                    <h1>Trivia</h1>
                </div>
            </div>
        </header>
    );
  }