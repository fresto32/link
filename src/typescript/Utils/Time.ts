import EventEmitter from './EventEmitter'

export default class Time extends EventEmitter
{
    /** start time */
    start: number;
    /** current time */
    current: number;
    /** elapsed time since start */
    elapsed: number;
    /** time since last tick */
    delta: number;
    /** animation frame */
    ticker: number;

    /**
     * Constructor
     */
    constructor()
    {
        super()

        // Set up
        this.start = Date.now()
        this.current = this.start
        this.elapsed = 0
        this.delta = 16

        this.tick = this.tick.bind(this)
        this.tick()
    }

    /**
     * Tick
     */
    tick()
    {
        this.ticker = window.requestAnimationFrame(this.tick)

        const current = Date.now()

        this.delta = current - this.current
        this.elapsed = current - this.start
        this.current = current

        if(this.delta > 60) this.delta = 60

        this.trigger('tick', null)
    }

    /**
     * Stop
     */
    stop()
    {
        window.cancelAnimationFrame(this.ticker)
    }
}
