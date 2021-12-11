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

    public randomize(): void {
        this.color = Card.randomColor();
        this.value = Card.randomValue();
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

    private static randomValue(): CardValue {
        const values: CardValue[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+2', '+4', 'reverse', 'skip', 'pickColor'];
        return values[Math.floor(Math.random() * values.length)];
    }

    private static randomColor(): CardColor {
        const colors: CardColor[] = ['red', 'green', 'blue', 'yellow', 'black'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

export { CardColor, CardValue, CardState, Card };