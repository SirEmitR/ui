const socket = new WebSocket('ws://localhost:41200');

const $ = (selector) => document.querySelector(selector);
const $start = $('#start');
const $board = $('#board');
const $score = $('#score');
const $players = $('#players');
let playing = false;
let me = -1;
let isHunter = false;
socket.onopen = () => {
  console.log('Connected');
};

socket.onmessage = (event) => {
    console.log('Message:', event.data);
    const data = JSON.parse(event.data);
    if (data.type === 'connected') {
        console.log('Join:', data.data);
        me = data.data.you;
        playing = true;
    }
    if (data.type === 'map') {
        if(me !== -1){
            const player = data.data.players.find(player => player.id === me);
            $score.innerHTML = `${player.score}`;
            if(player.role === 1){
                isHunter = true;
            }else{
                isHunter = false;
            }
        }
    }

    $players.innerHTML = data.data.players.length
    printBoard(data.data);
}

socket.onclose = () => {
  console.log('Disconnected');
};

$start.addEventListener('click', () => {
    const jsonData = {
        type: 'join',
        data: null
    }
    socket.send(JSON.stringify(jsonData));
    $start.disabled = true;
    $start.style.display = 'none';
});

function printBoard(board) {
    $board.innerHTML = '';
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
            const newDiv = document.createElement('div');
            newDiv.style.gridColumn = j + 1;
            newDiv.style.gridRow = i + 1;
            newDiv.style.border = '1px solid black';
            const existUser = board.players.find(player => player.x === j && player.y === i);
            if (existUser) {
                newDiv.style.backgroundImage ='url(./players.png)';
                newDiv.style.backgroundSize = '218px';
                const x = (existUser.color * 40) ;
                newDiv.style.backgroundPosition = `-${x}px -6px`;
                if(existUser.role === 1){
                    const y = (existUser.color * 44);
                    newDiv.style.backgroundPosition = `-${x}px -${y}px`;
                }
            }
            const existsCoin = board.coins.find(coin => coin.x === j && coin.y === i);
            if (existsCoin) {
                const coin = document.createElement('div');
                coin.classList.add('coin');
                if(isHunter){
                    coin.style.opacity = '0.3'
                }
                newDiv.appendChild(coin);
            }
            
            $board.appendChild(newDiv);
        }
    }
}

document.addEventListener('keydown', function(event) {
    if(!playing) return;
    if (event.key === 'w') {
        socket.send(JSON.stringify({type: 'move', data: {id: me, key: 'w'}}));
    }
    if (event.key === 's') {
        socket.send(JSON.stringify({type: 'move', data: {id: me, key: 's'}}));
    }
    if (event.key === 'a') {
        socket.send(JSON.stringify({type: 'move', data: {id: me, key: 'a'}}));
    }
    if (event.key === 'd') {
        socket.send(JSON.stringify({type: 'move', data: {id: me, key: 'd'}}));
    }
})