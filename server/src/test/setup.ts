// tsyringe reads decorator metadata, which requires the reflect polyfill to be
// loaded before any decorated module. Unit tests import use cases directly, so
// the polyfill is loaded here (the app entry point loads it in production).
import 'reflect-metadata';
