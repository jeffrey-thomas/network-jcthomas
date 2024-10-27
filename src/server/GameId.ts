const symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

export namespace GameId {

    /**
     * Generate a string of random capital letters for a game id
     * @param length the length of the string to generate
     * @returns a randomly generated string of capital letters
     */
    export const generate = (length: number) => {
        let result = ''
        while (result.length < length) {
            result += symbols.charAt(Math.floor(Math.random() * symbols.length))
        }
        return result
    }

}