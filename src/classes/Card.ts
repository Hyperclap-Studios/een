type CardColor = 'red' | 'green' | 'blue' | 'yellow' | 'black';
type CardValue = number | '+2' | '+4' | 'reverse' | 'skip' | 'pickColor';
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

    public canFollow(precedingCard: Card): boolean {
        return this.color === 'black' || this.color === precedingCard.color || this.value === precedingCard.value;
        // Note: To solve problem with black cards convert black cards to colorful one upon playing it.
    }

    public canPlay(precedingCard: Card): boolean {
        return this.canFollow(precedingCard) && this.state === 'deck';
    }

    public play(precedingCard: Card, wishColor?: CardColor): void {
        if (this.canPlay(precedingCard)) {
            this.state = 'played';
            if (this.color === 'black' && wishColor) {
                this.color = wishColor;
            }
        }
    }
}

export { CardColor, CardValue, CardState, Card };