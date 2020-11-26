const footerStyle = {
    position: 'absolute',
    margin: 'auto',
    left: 0,
    right: 0,
    minHeight: '200px',
    backgroundColor: '#636363',
    marginTop: '1.5rem'
}

export default function Footer() {
    return (
        <footer style={footerStyle}>
            <div>Icons made by <a href="https://www.flaticon.com/authors/pixel-perfect" title="Pixel perfect">Pixel perfect</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
        </footer>
    )
}