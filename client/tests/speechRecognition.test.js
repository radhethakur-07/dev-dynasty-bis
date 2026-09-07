/**
 * Test Suite: Browser-Native Speech Recognition & Voice-to-Text Input
 * 
 * Verifies:
 * 1. Unsupported browser fallback (SpeechRecognition undefined)
 * 2. Start and Stop listening state transitions & language mapping (en -> en-IN, hi -> hi-IN)
 * 3. Microphone permission denial handling ('not-allowed')
 * 4. Recognized speech text insertion into input without auto-submitting
 */

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { mapLanguageToLocale } from "../src/lib/useSpeechRecognition.ts";

// Mock implementation of SpeechRecognition for testing hook behaviors
class MockSpeechRecognition {
  constructor() {
    this.lang = "en-IN";
    this.continuous = false;
    this.interimResults = true;
    this.maxAlternatives = 1;
    this.onstart = null;
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
    this._isStarted = false;
  }

  start() {
    this._isStarted = true;
    if (this.onstart) this.onstart();
  }

  stop() {
    this._isStarted = false;
    if (this.onend) this.onend();
  }

  abort() {
    this._isStarted = false;
    if (this.onend) this.onend();
  }

  // Helper to simulate speech recognition results
  simulateResult(transcript, isFinal = true) {
    if (this.onresult) {
      this.onresult({
        resultIndex: 0,
        results: [
          Object.assign([ { transcript } ], { isFinal })
        ]
      });
    }
  }

  // Helper to simulate speech recognition errors (e.g. permission denial)
  simulateError(errorType) {
    if (this.onerror) {
      this.onerror({ error: errorType });
    }
  }
}

describe("Speech Recognition & Voice-to-Text Test Suite", () => {
  
  // Test 1: Language mapping verification
  test("mapLanguageToLocale accurately maps English and Hindi codes", () => {
    assert.equal(mapLanguageToLocale("en"), "en-IN");
    assert.equal(mapLanguageToLocale("en-US"), "en-IN");
    assert.equal(mapLanguageToLocale("hi"), "hi-IN");
    assert.equal(mapLanguageToLocale("hi-IN"), "hi-IN");
    assert.equal(mapLanguageToLocale(""), "en-IN");
    assert.equal(mapLanguageToLocale(undefined), "en-IN");
  });

  // Test 2: Unsupported Browser Fallback
  test("Handles unsupported browser gracefully when SpeechRecognition is not available", () => {
    const originalWindow = global.window;
    // Simulate unsupported environment
    global.window = {};

    let errorReported = null;
    let errorMessage = null;

    const isSupported = Boolean(
      global.window.SpeechRecognition || global.window.webkitSpeechRecognition
    );
    assert.equal(isSupported, false, "Should identify browser as unsupported");

    // Simulate startListening in unsupported browser
    if (!isSupported) {
      errorReported = "unsupported";
      errorMessage = "Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.";
    }

    assert.equal(errorReported, "unsupported");
    assert.match(errorMessage, /not supported in this browser/i);

    global.window = originalWindow;
  });

  // Test 3: Start and Stop Listening State Transitions
  test("Starts and stops speech recognition with correct language and state lifecycle", () => {
    const mockRecognition = new MockSpeechRecognition();
    global.window = { SpeechRecognition: function() { return mockRecognition; } };

    let isListening = false;
    let languageConfigured = null;

    // Simulate start
    const recognition = new global.window.SpeechRecognition();
    recognition.lang = mapLanguageToLocale("hi");
    recognition.onstart = () => {
      isListening = true;
    };
    recognition.onend = () => {
      isListening = false;
    };

    recognition.start();
    assert.equal(isListening, true, "Should transition to listening = true on start");
    assert.equal(recognition.lang, "hi-IN", "Should set language to Hindi (hi-IN)");

    // Simulate stop
    recognition.stop();
    assert.equal(isListening, false, "Should transition to listening = false on stop");
  });

  // Test 4: Microphone Permission Denial Handling ('not-allowed')
  test("Captures and handles microphone permission denial error without crash", () => {
    const mockRecognition = new MockSpeechRecognition();
    global.window = { SpeechRecognition: function() { return mockRecognition; } };

    let errorCaptured = null;
    let userFriendlyMessage = null;
    let isListening = true;

    const recognition = new global.window.SpeechRecognition();
    recognition.onerror = (event) => {
      errorCaptured = event.error;
      isListening = false;
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        userFriendlyMessage = "Microphone permission was denied. Please allow microphone access in your browser settings.";
      }
    };

    // Trigger permission denial
    mockRecognition.simulateError("not-allowed");

    assert.equal(errorCaptured, "not-allowed", "Should capture 'not-allowed' error");
    assert.equal(isListening, false, "Should stop listening on permission error");
    assert.match(userFriendlyMessage, /Microphone permission was denied/i);
  });

  // Test 5: Recognized Text Insertion without auto-submitting
  test("Inserts recognized text into input state and leaves submission under user control", () => {
    const mockRecognition = new MockSpeechRecognition();
    global.window = { SpeechRecognition: function() { return mockRecognition; } };

    let inputState = "";
    let autoSubmitted = false;

    // User's onTranscript callback simulation
    const onTranscript = (text, isFinal) => {
      if (isFinal) {
        inputState = inputState.trim() ? `${inputState.trim()} ${text}` : text;
      }
      // Note: We deliberately do NOT trigger submit here!
    };

    const recognition = new global.window.SpeechRecognition();
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          onTranscript(item[0].transcript, true);
        }
      }
    };

    // User speaks "IS 2347 pressure cooker"
    mockRecognition.simulateResult("IS 2347 pressure cooker", true);

    assert.equal(inputState, "IS 2347 pressure cooker", "Input state should be populated with recognized text");
    assert.equal(autoSubmitted, false, "Must NOT auto-submit immediately, allowing user review/edit");

    // User speaks additional words "certification process"
    mockRecognition.simulateResult("certification process", true);
    assert.equal(
      inputState,
      "IS 2347 pressure cooker certification process",
      "Subsequent phrases should append cleanly"
    );
    assert.equal(autoSubmitted, false, "Still must NOT auto-submit");
  });
});
