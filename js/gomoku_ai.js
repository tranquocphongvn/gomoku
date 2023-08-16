import * as Global from './global.js'

let chessBoard = []
const board_boundary = 11;
const color_none = Global.EMPTY_CARO_VALUE


function logger(...log) {
    console.log(...log)
}

// The <new_position> relative to the <position>, <direction> and the <distance>
// x: row; y: column
function new_position_color(position, direction, distance){
    let position_x = position[0];
    let position_y = position[1];

    if (direction === 0) {
        position_x = position_x + distance;
    }else if(direction === 1){
        position_x = position_x + distance;
        position_y = position_y + distance;
    }else if(direction === 2){
        position_y = position_y + distance;
    }else if(direction === 3){
        position_x = position_x - distance;
        position_y = position_y + distance;
    }else if(direction === 4){
        position_x = position_x - distance;
    }else if(direction === 5){
        position_x = position_x - distance;
        position_y = position_y - distance;
    }else if(direction === 6){
        position_y = position_y - distance;
    }else if(direction === 7){
        position_x = position_x + distance;
        position_y = position_y - distance;
    }

    if(position_x < 0 || position_x >= Global.MAX_ROWS || position_y < 0 || position_y >= Global.MAX_COLUMNS){
        return board_boundary;
    }
    return chessBoard[position_x][position_y];
}

// the un-boundary is available, it means not bound by opponent, or itself (check_over_6 = true)
// unbound_value object {left, right}
// dont apply for small value <= 200
// return:
// 0: left and right bound (unavailable)
// 1: left/right bound only (unbound available)
// 2: no bound (unbound available)
function check_unbound_available(current_position, direction, left_bound, right_bound, color, unbound_value, check_at = '', check_over_6 = false) {
    if (check_over_6) {
        let left_value = (new_position_color(current_position, direction, left_bound) === color_none && new_position_color(current_position, direction, right_bound) !== color)
        let right_value = (new_position_color(current_position, direction, left_bound) !== color && new_position_color(current_position, direction, right_bound) === color_none)
        
        //logger('check_unbound_available. check_at:', check_at, ', current_position:', current_position, ', direction:', direction, ', left_bound:', left_bound, ', right_bound:', right_bound, ', color:', color, ', left_value:', left_value, ', right_value:', right_value, ', check_over_6:', check_over_6)

        if (unbound_value) {
            unbound_value.left = left_value + 0;
            unbound_value.right = right_value + 0;
            unbound_value.total = (left_value + right_value)
        }

        return  left_value + right_value;
    }
    else {
        let left_value = (new_position_color(current_position, direction, left_bound) === color_none)
        let right_value = (new_position_color(current_position, direction, right_bound) === color_none)
        //logger('check_unbound_available. check_at:', check_at, ', current_position:', current_position, ', direction:', direction, ', left_bound:', left_bound, ', right_bound:', right_bound, ', color:', color, ', left_value:', left_value, ', right_value:', right_value, ', check_over_6:', check_over_6)
        if (unbound_value) {
            unbound_value.left = left_value + 0;
            unbound_value.right = right_value + 0;
            unbound_value.total = (left_value + right_value)
        }
        return left_value + right_value;
        /*
        return (new_position_color(current_position, direction, left_bound) === color_none) + 
            (new_position_color(current_position, direction, right_bound) === color_none);
        */
    }    
}

export default function evaluate(current_position, color, player_color, opponent_color, caroBoard){
    chessBoard = caroBoard
    let value = 0;

    if (color === opponent_color) {
        value = value - 233;
    }

    const unbound_value = {left:undefined, right:undefined, total: undefined};


    // score to play a five in a row: 50000 + unbound_value.total * 2000 / 550000 (player)
    // score to play a four in a row: 320 + unbound_value.total * 1200  / 2000 + unbound_value.total * 3000 (player)
    // score to play a four in a row with 1 unbound: 1520 ???
    // score to play a three in a row: 700 - 800 ???  2 three > 1 four
    // score to play a three in a row with 1 unbound: 700 ???
    // score to play a two in a row: 125-150 ???
    // score to play a two in a row with 1 unbound: 120 ???
    

    for(var direction = 0; direction<4; direction++) {
        // ----------(1) Five (5) in a row 11111 , value: 50000
        // Five (5) in a row 1111* / ?1111*?
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, -2) === color &&
            new_position_color(current_position, direction, -3) === color &&
            new_position_color(current_position, direction, -4) === color && 
            check_unbound_available(current_position, direction, -5, 1, color, unbound_value, '1111* / ?1111*?', true))
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, -2) === color &&
            new_position_color(current_position, direction+4, -3) === color &&
            new_position_color(current_position, direction+4, -4) === color &&
            check_unbound_available(current_position, direction+4, -5, 1, color, unbound_value, '1111* / ?1111*?', true))
        ){            
            if(color === player_color){
                value += 500000;
            }
            value += 50000 + unbound_value.total * 2000;

            //logger('1111* / ?1111*?: value += 50000 + unbound_value.total * 2000:', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }
        // Five (5) in a row 111*1 / ?111*1?
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, -2) === color &&
            new_position_color(current_position, direction, -3) === color &&
            new_position_color(current_position, direction, 1) === color && 
            check_unbound_available(current_position, direction, -4, 2, color, unbound_value, '111*1 / ?111*1?', true))
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, -2) === color &&
            new_position_color(current_position, direction+4, -3) === color &&
            new_position_color(current_position, direction+4, 1) === color && 
            check_unbound_available(current_position, direction+4, -4, 2, color, unbound_value, '111*1 / ?111*1?', true))
        ){
            if(color === player_color){
                value += 500000;
            }
            value += 50000 + unbound_value.total * 2000;

            //logger('111*1 / ?111*1?: value += 50000 + unbound_value.total * 2000:', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }
        // Five (5) in a row 11*11 / ?11*11?
        if(new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, -2) === color &&
            new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, 2) === color && 
            check_unbound_available(current_position, direction, -3, 3, color, unbound_value, '11*11 / ?11*11?', true)
        ){
            if(color === player_color){
                value += 500000;
            }
            value += 50000 + unbound_value.total * 2000;

            //logger('11*11 / ?11*11?: value += 50000 + unbound_value.total * 2000:', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // Special cases
        // ---------- 1_11*1, just the same with OXXX because streak XXXXXX not win. Dont need to check bound
        // 1011*1 / ?1_11*1  / 4 in a row with 1 unbound
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, -2) === color &&
            new_position_color(current_position, direction, -3) === color_none &&
            new_position_color(current_position, direction, -4) === color &&
            new_position_color(current_position, direction, 1) === color)
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, -2) === color &&
            new_position_color(current_position, direction+4, -3) === color_none &&
            new_position_color(current_position, direction+4, -4) === color &&
            new_position_color(current_position, direction+4, 1) === color)
        ){
            value += 1150;

            logger('1011*1 / 1_11*1: value += 1150:', value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // ---------- 1*11_1, just the same with OXXX because streak XXXXXX not win
        // 1*1101 / 1*11_1  / 4 in a row with 1 unbound
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, 2) === color &&
            new_position_color(current_position, direction, 3) === color_none &&
            new_position_color(current_position, direction, 4) === color)
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, 1) === color &&
            new_position_color(current_position, direction+4, 2) === color &&
            new_position_color(current_position, direction+4, 3) === color_none &&
            new_position_color(current_position, direction+4, 4) === color)
        ){
            value += 1150;

            logger('1*1101 / 1*11_1: value += 1150:', value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // ---------- 11_11*, just the same with OXXX because streak XXXXXX not win
        // 11011* / 11_11*  /  3 in a row with 1 unbound
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, -2) === color &&
            new_position_color(current_position, direction, -3) === color_none &&
            new_position_color(current_position, direction, -4) === color &&
            new_position_color(current_position, direction, -5) === color)
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, -2) === color &&
            new_position_color(current_position, direction+4, -3) === color_none &&
            new_position_color(current_position, direction+4, -4) === color &&
            new_position_color(current_position, direction+4, -5) === color)
        ){
            value += 700;
            
            logger('11011* / 11_11*: value += 700:', value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }
        
        // ---------- *11_11, just the same with OXXX because streak XXXXXX not win
        // *11011 / *11_11  /  3 in a row with 1 unbound
        if((new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, 2) === color &&
            new_position_color(current_position, direction, 3) === color_none &&
            new_position_color(current_position, direction, 4) === color &&
            new_position_color(current_position, direction, 5) === color)
            ||
            (new_position_color(current_position, direction+4, 1) === color &&
            new_position_color(current_position, direction+4, 2) === color &&
            new_position_color(current_position, direction+4, 3) === color_none &&
            new_position_color(current_position, direction+4, 4) === color &&
            new_position_color(current_position, direction+4, 5) === color)
        ){
            value += 700;

            logger('*11011 / *11_11: value += 700:', value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }


        // ----------(2) Four (4) in the row: 011110 , value: 320 + unbound_value.total * 1200 // 4320
        // Four (4) in the row 0111*0 / ?_111*_?
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, -2) === color &&
            new_position_color(current_position, direction, -3) === color &&
            new_position_color(current_position, direction, -4) === color_none &&
            new_position_color(current_position, direction, 1) === color_none &&
            check_unbound_available(current_position, direction, -5, 2, color, unbound_value, '0111*0 / ?_111*_?', false))
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, -2) === color &&
            new_position_color(current_position, direction+4, -3) === color &&
            new_position_color(current_position, direction+4, -4) === color_none && 
            new_position_color(current_position, direction+4, 1) === color_none &&
            check_unbound_available(current_position, direction+4, -5, 2, color, unbound_value, '0111*0 / ?_111*_?', false))
        ){
            if(color === player_color){
                //value += 10000;
                value += 2000 + unbound_value.total * 3000;
            }

            // value += 4320
            value += 320 + unbound_value.total * 1200

            logger('0111*0 / ?_111*_?: value += 520 + unbound_value.total * 1000 (and + 10000?):', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // Four (4) in the row 011*10 / _11*1_ / 6 spaces, dont check bound
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, -2) === color &&
            new_position_color(current_position, direction, -3) === color_none &&
            new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, 2) === color_none &&
            check_unbound_available(current_position, direction, -4, 3, color, unbound_value, '011*10 / ?_11*1_?', false))
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, -2) === color &&
            new_position_color(current_position, direction+4, -3) === color_none &&
            new_position_color(current_position, direction+4, 1) === color &&
            new_position_color(current_position, direction+4, 2) === color_none &&
            check_unbound_available(current_position, direction+4, -4, 3, color, unbound_value, '011*10 / ?_11*1_?', false))
        ){
            if(color === player_color){
                //value += 10000;
                value += 2000 + unbound_value.total * 3000;
            }

            // value += 4320
            value += 320 + unbound_value.total * 1200

            logger('011*10 / _11*1_: value += 520 + unbound_value.total * 1000 (and + 10000?):', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // ---------- Three (3) in the row and Four (4) space. Value: 720 or 1720
        // （3）and (4) 011100
        // Three (3) in the row 011*00 / ?_11*__? / 6 spaces, dont check bound
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, -2) === color &&
            new_position_color(current_position, direction, -3) === color_none &&
            new_position_color(current_position, direction, 1) === color_none &&
            new_position_color(current_position, direction, 2) === color_none &&
            check_unbound_available(current_position, direction, -4, 3, color, unbound_value, '011*00 / ?_11*__?', false))
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, -2) === color &&
            new_position_color(current_position, direction+4, -3) === color_none &&
            new_position_color(current_position, direction+4, 2) === color_none &&
            new_position_color(current_position, direction+4, 1) === color_none &&
            check_unbound_available(current_position, direction+4, -4, 3, color, unbound_value, '011*00 / ?_11*__?', false))
        ){
            //value += 750;
            value += (350 + 220 * unbound_value.total);

            logger('011*00 / ?_11*__?: value += (350 + 200 * unbound_value.total):', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // Three (3) in the row 01*100 / ?_1*1__? / 6 spaces, dont check bound
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, -2) === color_none &&
            new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, 2) === color_none &&
            new_position_color(current_position, direction, 3) === color_none &&
            check_unbound_available(current_position, direction, -3, 4, color, unbound_value, '01*100 / ?_1*1__?', false))
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, -2) === color_none &&
            new_position_color(current_position, direction+4, 1) === color &&
            new_position_color(current_position, direction+4, 2) === color_none &&
            new_position_color(current_position, direction+4, 3) === color_none &&
            check_unbound_available(current_position, direction+4, -3, 4, color, unbound_value, '01*100 / ?_1*1__?', false))
        ){
            //value += 750;
            value += (350 + 220 * unbound_value.total);

            logger('01*100 / ?_1*1__?: value += (350 + 220 * unbound_value.total):', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // Three (3) in the row 0*1100 / ?_*11__?
        if((new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, 2) === color &&
            new_position_color(current_position, direction, 3) === color_none &&
            new_position_color(current_position, direction, 4) === color_none &&
            new_position_color(current_position, direction, -1) === color_none &&
            check_unbound_available(current_position, direction, -2, 5, color, unbound_value, '0*1100 / ?_*11__?', false))
            ||
            (new_position_color(current_position, direction+4, 1) === color &&
            new_position_color(current_position, direction+4, 2) === color &&
            new_position_color(current_position, direction+4, 3) === color_none &&
            new_position_color(current_position, direction+4, 4) === color_none &&
            new_position_color(current_position, direction+4, -1) === color_none &&
            check_unbound_available(current_position, direction+4, -2, 5, color, unbound_value, '0*1100 / ?_*11__?', false))
        ){
            //value += 750;
            value += (350 + 220 * unbound_value.total);

            logger('0*1100 / ?_*11__?: value += (350 + 220 * unbound_value.total):', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // ---隔3（5） and (6) 011010
        // 隔3 0110*0 / ?_11_*_? / 6 spaces, dont check bound
        if((new_position_color(current_position, direction, -2) === color &&
            new_position_color(current_position, direction, -3) === color &&
            new_position_color(current_position, direction, -1) === color_none &&
            new_position_color(current_position, direction, -4) === color_none &&
            new_position_color(current_position, direction, 1) === color_none &&
            check_unbound_available(current_position, direction, -5, 2, color, unbound_value, '0110*0 / ?_11_*_?', false))
            ||
            (new_position_color(current_position, direction+4, -2) === color &&
            new_position_color(current_position, direction+4, -3) === color &&
            new_position_color(current_position, direction+4, -1) === color_none &&
            new_position_color(current_position, direction+4, -4) === color_none &&
            new_position_color(current_position, direction+4, 1) === color_none &&
            check_unbound_available(current_position, direction+4, -5, 2, color, unbound_value, '0110*0 / ?_11_*_?', false))
        ){
            //value += 700;
            value += (300 + 220 * unbound_value.total);

            logger('0*1100 / ?_*11__?: value += (300 + 220 * unbound_value.total):', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // 隔3 01*010 / ?_1*_1_?
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, 2) === color &&
            new_position_color(current_position, direction, -2) === color_none &&
            new_position_color(current_position, direction, 1) === color_none &&
            new_position_color(current_position, direction, 3) === color_none &&
            check_unbound_available(current_position, direction, -3, 4, color, unbound_value, '01*010 / ?_1*_1_?', false))
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, 2) === color &&
            new_position_color(current_position, direction+4, -2) === color_none &&
            new_position_color(current_position, direction+4, 1) === color_none &&
            new_position_color(current_position, direction+4, 3) === color_none &&
            check_unbound_available(current_position, direction+4, -3, 4, color, unbound_value, '01*010 / ?_1*_1_?', false))
        ){
            //value += 700;
            value += (300 + 220 * unbound_value.total);

            logger('01*010 / ?_1*_1_?: value += (300 + 220 * unbound_value.total):', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // 隔3 0*1010 / ?_*1_1_? / 6 spaces, dont check bound
        if((new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, 3) === color &&
            new_position_color(current_position, direction, -1) === color_none &&
            new_position_color(current_position, direction, 2) === color_none &&
            new_position_color(current_position, direction, 4) === color_none &&
            check_unbound_available(current_position, direction, -2, 5, color, unbound_value, '0*1010 / ?_*1_1_?', false))
            ||
            (new_position_color(current_position, direction+4, 1) === color &&
            new_position_color(current_position, direction+4, 3) === color &&
            new_position_color(current_position, direction+4, -1) === color_none &&
            new_position_color(current_position, direction+4, 2) === color_none &&
            new_position_color(current_position, direction+4, 4) === color_none &&
            check_unbound_available(current_position, direction+4, -2, 5, color, unbound_value, '0*1010 / ?_*1_1_?', false))
        ){
            //value += 700;
            value += (300 + 220 * unbound_value.total);

            logger('0*1010 / ?_*1_1_?: value += (300 + 220 * unbound_value.total):', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // ----------死四（7）and (8) 11110
        // 死四 111*0 / ?111*_?
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, -2) === color &&
            new_position_color(current_position, direction, -3) === color &&
            new_position_color(current_position, direction, 1) === color_none && 
            check_unbound_available(current_position, direction, -4, 2, color, unbound_value, '111*0 / ?111*_?', true))
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, -2) === color &&
            new_position_color(current_position, direction+4, -3) === color &&
            new_position_color(current_position, direction+4, 1) === color_none && 
            check_unbound_available(current_position, direction+4, -4, 2, color, unbound_value, '111*0 / ?111*_?', true))
        ){
            //value += 1770;

            // unbound_value.total not 2 because it has at least 1 bound
            value += 1250;
            
            logger('?111*0? / ?111*_?: value += 1250:', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // 死四 11*10 / ?11*1_?
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, -2) === color &&
            new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, 2) === color_none && 
            check_unbound_available(current_position, direction, -3, 3, color, unbound_value, '11*10 / ?11*1_?', true))
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, -2) === color &&
            new_position_color(current_position, direction+4, 1) === color &&
            new_position_color(current_position, direction+4, 2) === color_none && 
            check_unbound_available(current_position, direction+4, -3, 3, color, unbound_value, '11*10 / ?11*1_?', true))
        ){
            //value += 1770;
            
            // unbound_value.total not 2 because it has at least 1 bound
            value += 1250;
        
            logger('?11*10? / ?11*1_?: value += 1250:', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // 死四 1*110 / ?1*11_?
        if((new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, 2) === color &&
            new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, 3) === color_none && 
            check_unbound_available(current_position, direction, -2, 4, color, unbound_value, '1*110 / ?1*11_?', true))
            ||
            (new_position_color(current_position, direction+4, 1) === color &&
            new_position_color(current_position, direction+4, 2) === color &&
            new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, 3) === color_none && 
            check_unbound_available(current_position, direction+4, -2, 4, color, unbound_value, '1*110 / ?1*11_?', true))
        ){
            //value += 1770;
            
            // unbound_value.total not 2 because it has at least 1 bound
            value += 1250;

            logger('?1*110? / ?1*11_?: value += 1250:', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // 死四 *1110 / ?*111_?
        if((new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, 2) === color &&
            new_position_color(current_position, direction, 3) === color &&
            new_position_color(current_position, direction, 4) === color_none && 
            check_unbound_available(current_position, direction, -1, 5, color, unbound_value, '*1110 / ?*111_?', true))
            ||
            (new_position_color(current_position, direction+4, 1) === color &&
            new_position_color(current_position, direction+4, 2) === color &&
            new_position_color(current_position, direction+4, 3) === color &&
            new_position_color(current_position, direction+4, 4) === color_none && 
            check_unbound_available(current_position, direction+4, -1, 5, color, unbound_value, '*1110 / ?*111_?', true))
        ){
            //value += 1770;
            
            // unbound_value.total not 2 because it has at least 1 bound
            value += 1250;
            
            logger('?*1110? / ?*111_?: value += 1250:', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // ----------（9） 隔四 11011
        // 隔四 1*011 / ?1*_11?
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, 2) === color &&
            new_position_color(current_position, direction, 3) === color &&
            new_position_color(current_position, direction, 1) === color_none && 
            check_unbound_available(current_position, direction, -2, 4, color, unbound_value, '1*011 / ?1*_11?'))
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, 2) === color &&
            new_position_color(current_position, direction+4, 3) === color &&
            new_position_color(current_position, direction+4, 1) === color_none && 
            check_unbound_available(current_position, direction+4, -2, 4, color, unbound_value, '1*011 / ?1*_11?'))
        ){
            //value += 720;
            if (unbound_value.total)
                value += (150 + 350 * unbound_value.total);

            logger('1*011 / ?1*_11?: value += (150 + 350 * unbound_value):', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // 隔四 *1011 / ?*1_11?
        if((new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, 3) === color &&
            new_position_color(current_position, direction, 4) === color &&
            new_position_color(current_position, direction, 2) === color_none && 
            check_unbound_available(current_position, direction, -1, 5, color, unbound_value, '*1011 / ?*1_11?'))
            ||
            (new_position_color(current_position, direction+4, 1) === color &&
            new_position_color(current_position, direction+4, 3) === color &&
            new_position_color(current_position, direction+4, 4) === color &&
            new_position_color(current_position, direction+4, 2) === color_none && 
            check_unbound_available(current_position, direction+4, -1, 5, color, unbound_value, '*1011 / ?*1_11?'))
        ){
            //value += 720;
            if (unbound_value.total)
                value += (150 + 350 * unbound_value.total);
            
            logger('*1011 / ?*1_11?: value += (150 + 350 * unbound_value):', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // 隔四（10） and (11) 11101
        // 隔四 11*01 / ?11*_1?
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, -2) === color &&
            new_position_color(current_position, direction, 2) === color &&
            new_position_color(current_position, direction, 1) === color_none && 
            check_unbound_available(current_position, direction, -3, 3, color, unbound_value, '11*01 / ?11*_1?'))
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, -2) === color &&
            new_position_color(current_position, direction+4, 2) === color &&
            new_position_color(current_position, direction+4, 1) === color_none && 
            check_unbound_available(current_position, direction+4, -3, 3, color, unbound_value, '11*01 / ?11*_1?'))
        ){
            //value += 745;
            if (unbound_value.total)
                value += (160 + 370 * unbound_value.total);

            logger('11*01 / ?11*_1?: value += (160 + 370 * unbound_value.total):', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // 隔四 1*101 / ?1*1_1?
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, 3) === color &&
            new_position_color(current_position, direction, 2) === color_none && 
            check_unbound_available(current_position, direction, -2, 4, color, unbound_value, '1*101 / ?1*1_1?'))
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, 1) === color &&
            new_position_color(current_position, direction+4, 3) === color &&
            new_position_color(current_position, direction+4, 2) === color_none && 
            check_unbound_available(current_position, direction+4, -2, 4, color, unbound_value, '1*101 / ?1*1_1?'))
        ){
            //value += 745;
            if (unbound_value.total)
                value += (160 + 370 * unbound_value.total);

            logger('1*101 / ?1*1_1?: value += (160 + 370 * unbound_value.total):', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // 隔四 *1101 / ?*11_1?
        if((new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, 2) === color &&
            new_position_color(current_position, direction, 4) === color &&
            new_position_color(current_position, direction, 3) === color_none && 
            check_unbound_available(current_position, direction, -1, 5, color, unbound_value, '*1101 / ?*11_1?'))
            ||
            (new_position_color(current_position, direction+4, 1) === color &&
            new_position_color(current_position, direction+4, 2) === color &&
            new_position_color(current_position, direction+4, 4) === color &&
            new_position_color(current_position, direction+4, 3) === color_none && 
            check_unbound_available(current_position, direction+4, -1, 5, color, unbound_value, '*1101 / ?*11_1?'))
        ){
            //value += 745;
            if (unbound_value.total)
                value += (160 + 370 * unbound_value.total);

            logger('*1101 / ?*11_1?: value += (160 + 370 * unbound_value.total):', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // 隔四 1110* / ?111_*?
        if((new_position_color(current_position, direction, -2) === color &&
            new_position_color(current_position, direction, -3) === color &&
            new_position_color(current_position, direction, -4) === color &&
            new_position_color(current_position, direction, -1) === color_none && 
            check_unbound_available(current_position, direction, -5, 1, color, unbound_value, '1110* / ?111_*?'))
            ||
            (new_position_color(current_position, direction+4, -2) === color &&
            new_position_color(current_position, direction+4, -3) === color &&
            new_position_color(current_position, direction+4, -4) === color &&
            new_position_color(current_position, direction+4, -1) === color_none && 
            check_unbound_available(current_position, direction+4, -5, 1, color, unbound_value, '1110* / ?111_*?'))
        ){
            //value += 745;
            if (unbound_value.total)
                value += (160 + 370 * unbound_value.total);

            logger('1110* / ?111_*?: value += (160 + 370 * unbound_value.total):', value, ', unbound_value:', unbound_value, ', current_position:', current_position, ', color:', color, ', player_color:', player_color, ', opponent_color:', opponent_color)
            continue;
        }

        // 活二（12） 001100
        // 活二 001*00 125  / ?__1*__?
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, -2) === color_none &&
            new_position_color(current_position, direction, -3) === color_none &&
            new_position_color(current_position, direction, 1) === color_none &&
            new_position_color(current_position, direction, 2) === color_none)
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, -2) === color_none &&
            new_position_color(current_position, direction+4, -3) === color_none &&
            new_position_color(current_position, direction+4, 1) === color_none &&
            new_position_color(current_position, direction+4, 2) === color_none)
        ){
            value += 125;
            continue;
        }

        // 偏二
        // 偏二 （12.5） 000110
        // 000*10 / ?___1*_?
        if((new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, 2) === color_none &&
            new_position_color(current_position, direction, -3) === color_none &&
            new_position_color(current_position, direction, -1) === color_none &&
            new_position_color(current_position, direction, -2) === color_none)
            ||
            (new_position_color(current_position, direction+4, 1) === color &&
            new_position_color(current_position, direction+4, -2) === color_none &&
            new_position_color(current_position, direction+4, -3) === color_none &&
            new_position_color(current_position, direction+4, -1) === color_none &&
            new_position_color(current_position, direction+4, 2) === color_none)
        ){
            value += 125;
            continue;
        }

        // 0001*0 / ?___1*_?
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, -4) === color_none &&
            new_position_color(current_position, direction, -3) === color_none &&
            new_position_color(current_position, direction, 1) === color_none &&
            new_position_color(current_position, direction, -2) === color_none)
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, -2) === color_none &&
            new_position_color(current_position, direction+4, -3) === color_none &&
            new_position_color(current_position, direction+4, 1) === color_none &&
            new_position_color(current_position, direction+4, -4) === color_none)
        ){
            value += 125;
            continue;
        }

        // 死三 （17） 11100
        // 11*00 / ?11*__?
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, -2) === color &&
            new_position_color(current_position, direction, 2) === color_none &&
            new_position_color(current_position, direction, 1) === color_none)
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, -2) === color &&
            new_position_color(current_position, direction+4, 2) === color_none &&
            new_position_color(current_position, direction+4, 1) === color_none)
        ){
            value += 120;
            continue;
        }

        // 1*100 / ?1*1__?
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, 2) === color_none &&
            new_position_color(current_position, direction, 3) === color_none)
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, 1) === color &&
            new_position_color(current_position, direction+4, 2) === color_none &&
            new_position_color(current_position, direction+4, 3) === color_none)
        ){
            value += 120;
            continue;
        }

        // *1100 / ?*11__?
        if((new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, 2) === color &&
            new_position_color(current_position, direction, 3) === color_none &&
            new_position_color(current_position, direction, 4) === color_none)
            ||
            (new_position_color(current_position, direction+4, 1) === color &&
            new_position_color(current_position, direction+4, 2) === color &&
            new_position_color(current_position, direction+4, 3) === color_none &&
            new_position_color(current_position, direction+4, 4) === color_none)
        ){
            value += 120;
            continue;
        }

        // 死三 （18） 10110
        // 101*0 / ?1_1*_?
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, -3) === color &&
            new_position_color(current_position, direction, -2) === color_none &&
            new_position_color(current_position, direction, 1) === color_none)
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, -3) === color &&
            new_position_color(current_position, direction+4, -2) === color_none &&
            new_position_color(current_position, direction+4, 1) === color_none)
        ){
            value += 120;
            continue;
        }

        // *0110 / ?*_11_?
        if((new_position_color(current_position, direction, 2) === color &&
            new_position_color(current_position, direction, 3) === color &&
            new_position_color(current_position, direction, 4) === color_none &&
            new_position_color(current_position, direction, 1) === color_none)
            ||
            (new_position_color(current_position, direction+4, 2) === color &&
            new_position_color(current_position, direction+4, 3) === color &&
            new_position_color(current_position, direction+4, 4) === color_none &&
            new_position_color(current_position, direction+4, 1) === color_none)
        ){
            value += 120;
            continue;
        }

        // 10*10 / ?1_*1_?
        if((new_position_color(current_position, direction, -2) === color &&
            new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, -1) === color_none &&
            new_position_color(current_position, direction, 2) === color_none)
            ||
            (new_position_color(current_position, direction+4, -2) === color &&
            new_position_color(current_position, direction+4, 1) === color &&
            new_position_color(current_position, direction+4, -1) === color_none &&
            new_position_color(current_position, direction+4, 2) === color_none)
        ){
            value += 120;
            continue;
        }

        // 死三 （19） 10101
        // *0101 / ?*_1_1?
        if((new_position_color(current_position, direction, 2) === color &&
            new_position_color(current_position, direction, 4) === color &&
            new_position_color(current_position, direction, 1) === color_none &&
            new_position_color(current_position, direction, 3) === color_none)
            ||
            (new_position_color(current_position, direction+4, 2) === color &&
            new_position_color(current_position, direction+4, 4) === color &&
            new_position_color(current_position, direction+4, 1) === color_none &&
            new_position_color(current_position, direction+4, 3) === color_none)
        ){
            value += 120;
            continue;
        }

        // 10*01 / ?1_*_1?
        if((new_position_color(current_position, direction, 2) === color &&
            new_position_color(current_position, direction, -2) === color &&
            new_position_color(current_position, direction, 1) === color_none &&
            new_position_color(current_position, direction, -1) === color_none)
            ||
            (new_position_color(current_position, direction+4, 2) === color &&
            new_position_color(current_position, direction+4, -2) === color &&
            new_position_color(current_position, direction+4, 1) === color_none &&
            new_position_color(current_position, direction+4, -1) === color_none)
        ){
            value += 120;
            continue;
        }

        // 死三（20） 01110
        // 0*110 / ?_*11_?
        if((new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, 2) === color &&
            new_position_color(current_position, direction, -1) === color_none &&
            new_position_color(current_position, direction, 3) === color_none)
            ||
            (new_position_color(current_position, direction+4, 1) === color &&
            new_position_color(current_position, direction+4, 2) === color &&
            new_position_color(current_position, direction+4, -1) === color_none &&
            new_position_color(current_position, direction+4, 3) === color_none)
        ){
            value += 120;
            continue;
        }

        // 01*10 / ?_1*1_?
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, -2) === color_none &&
            new_position_color(current_position, direction, 2) === color_none)
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, 1) === color &&
            new_position_color(current_position, direction+4, -2) === color_none &&
            new_position_color(current_position, direction+4, 2) === color_none)
        ){
            value += 120;
            continue;
        }

        // 死三（21） 11010
        // *1010 / ?*1_1_?
        if((new_position_color(current_position, direction, 1) === color &&
            new_position_color(current_position, direction, 3) === color &&
            new_position_color(current_position, direction, 2) === color_none &&
            new_position_color(current_position, direction, 4) === color_none)
            ||
            (new_position_color(current_position, direction+4, 1) === color &&
            new_position_color(current_position, direction+4, 3) === color &&
            new_position_color(current_position, direction+4, 2) === color_none &&
            new_position_color(current_position, direction+4, 4) === color_none)
        ){
            value += 120;
            continue;
        }

        // 1*010 / ?1*_1_?
        if((new_position_color(current_position, direction, -1) === color &&
            new_position_color(current_position, direction, 2) === color &&
            new_position_color(current_position, direction, 1) === color_none &&
            new_position_color(current_position, direction, 3) === color_none)
            ||
            (new_position_color(current_position, direction+4, -1) === color &&
            new_position_color(current_position, direction+4, 2) === color &&
            new_position_color(current_position, direction+4, 1) === color_none &&
            new_position_color(current_position, direction+4, 3) === color_none)
        ){
            value += 120;
            continue;
        }

        // 110*0 / ?11_*_?
        if((new_position_color(current_position, direction, -2) === color &&
            new_position_color(current_position, direction, -3) === color &&
            new_position_color(current_position, direction, -1) === color_none &&
            new_position_color(current_position, direction, 1) === color_none)
            ||
            (new_position_color(current_position, direction+4, -2) === color &&
            new_position_color(current_position, direction+4, -3) === color &&
            new_position_color(current_position, direction+4, -1) === color_none &&
            new_position_color(current_position, direction+4, 1) === color_none)
        ){
            value += 120;
        }

        // 隔二 （13）and (14) 001010
        // 隔二 0010*0 / 6 spaces, dont check bound
        if((new_position_color(current_position, direction, -2) === color &&
            new_position_color(current_position, direction, -1) === color_none &&
            new_position_color(current_position, direction, -3) === color_none &&
            new_position_color(current_position, direction, -4) === color_none &&
            new_position_color(current_position, direction, 1) === color_none)
            ||
            (new_position_color(current_position, direction+4, -2) === color &&
            new_position_color(current_position, direction+4, -1) === color_none &&
            new_position_color(current_position, direction+4, -3) === color_none &&
            new_position_color(current_position, direction+4, 1) === color_none &&
            new_position_color(current_position, direction+4, -4) === color_none)
        ){
            value += 115;
            continue;
        }

        // 隔二 00*010
        if((new_position_color(current_position, direction, 2) === color &&
            new_position_color(current_position, direction, -1) === color_none &&
            new_position_color(current_position, direction, -2) === color_none &&
            new_position_color(current_position, direction, 1) === color_none &&
            new_position_color(current_position, direction, 3) === color_none)
            ||
            (new_position_color(current_position, direction+4, 2) === color &&
            new_position_color(current_position, direction+4, -1) === color_none &&
            new_position_color(current_position, direction+4, -2) === color_none &&
            new_position_color(current_position, direction+4, 1) === color_none &&
            new_position_color(current_position, direction+4, 3) === color_none)
        ){
            value += 115;
            continue;
        }

        // 活一 000*00 （15） and (16)
        if((new_position_color(current_position, direction, 2) === color_none &&
            new_position_color(current_position, direction, -1) === color_none &&
            new_position_color(current_position, direction, -2) === color_none &&
            new_position_color(current_position, direction, 1) === color_none &&
            new_position_color(current_position, direction, -3) === color_none)
            ||
            (new_position_color(current_position, direction+4, 2) === color_none &&
            new_position_color(current_position, direction+4, -1) === color_none &&
            new_position_color(current_position, direction+4, -2) === color_none &&
            new_position_color(current_position, direction+4, 1) === color_none &&
            new_position_color(current_position, direction+4, -3) === color_none)
        ){
            value += 1;
            continue;
        }
    }
    return value;
}