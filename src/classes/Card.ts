type CardColor = 'red' | 'green' | 'blue' | 'yellow' | 'black';
type CardValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '+2' | '+4' | 'reverse' | 'skip' | 'pickColor';
type CardState = 'deck' | 'played';

class Card {
    public color: CardColor;
    public value: CardValue;
    public state: CardState;

    constructor(color: CardColor = 'black', value: CardValue = 'pickColor', state: CardState = 'deck') {
        this.color = color;
        this.value = value;
        this.state = state;
    }

    public randomize(allowBlack = true): void {
        this.color = Card.randomColor(allowBlack);
        this.value = Card.randomValue(this.color);
    }

    public canFollow(precedingCard: Card): boolean {
        return this.color === 'black' || this.color === precedingCard.color || this.value === precedingCard.value;
        // Note: To solve problem with black cards convert black cards to colorful one upon playing it.
    }

    public canPlay(precedingCard: Card): boolean {
        return this.canFollow(precedingCard) && this.state === 'deck';
    }

    public play(precedingCard: Card, wishColor?: CardColor): boolean {
        if (this.canPlay(precedingCard)) {
            this.state = 'played';
            if (this.color === 'black' && wishColor) {
                this.color = wishColor;
            }
            return true;
        }
        return false;
    }

    private static randomValue(color: CardColor): CardValue {
        const valuesBasic: Array<CardValue> = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+2', 'reverse', 'skip'];
        const valuesBlack: Array<CardValue> = ['+4', 'pickColor'];
        if (color === 'black') return valuesBlack[Math.floor(Math.random() * valuesBlack.length)];
        else return valuesBasic[Math.floor(Math.random() * valuesBasic.length)];
    }

    private static randomColor(allowBlack = true): CardColor {
        const colors: CardColor[] = ['red', 'green', 'blue', 'yellow'];
        const BLACK_CHANCE = allowBlack ? 0.1 : 0;
        return Math.random() < BLACK_CHANCE ? 'black' : colors[Math.floor(Math.random() * colors.length)];
    }
}

export { CardColor, CardValue, CardState, Card };