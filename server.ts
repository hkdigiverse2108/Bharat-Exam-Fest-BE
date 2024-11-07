import { server } from './src';
import { config } from './config';

const port = config.PORT || 7000;

server.listen(port, (): void => {
    // console.log(`server started on port http://localhost:${port}`);
    console.log(`API Documentation http://localhost:${port}/api-docs`);
});