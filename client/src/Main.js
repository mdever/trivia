import './Main.css';

export default function(props) {
    return (
        <div id="main">
            <h3>Trivia</h3>
            { props.children }
        </div>
    )
}
