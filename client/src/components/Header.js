const headerStyle = {
    paddingTop: '3rem'
}

export default function Header() {
    return (
        <header style={headerStyle}>
            <div className="row">
                <div className="col-sm">
                    <h3>Trivia</h3>
                </div>
            </div>
        </header>
    );
  }