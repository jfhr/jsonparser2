declare module '@jfhr/jsonparser2' {
    class JsonParser {
        constructor(callbacks: Partial<{
            onobjectstart: () => void,
            onobjectend: () => void,
            onarraystart: () => void,
            onarrayend: () => void,
            onkey: (key: string) => void,
            onstring: (value: string) => void,
            onnumber: (value: number) => void,
            onboolean: (value: boolean) => void,
            onnull: () => void,
        }>);

        write(text: string): void;

        end(text?: string): void;
    }
}
