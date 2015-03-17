/* Motion detection using the doppler effect
 * http://danielrapp.github.io/doppler/
 *
 * based on SoundWave paper
 * http://research.microsoft.com/en-us/um/redmond/groups/cue/publications/guptasoundwavechi2012.pdf
 */

'use strict';

var round = Math.round;

function doppler() {

    var AuContext = (
        window.AudioContext ||
        window.webkitAudioContext ||
        window.mozAudioContext ||
        window.oAudioContext ||
        window.msAudioContext
    );

    var ctx = new AuContext();
    var osc = ctx.createOscillator();

    // This is just preliminary, we'll actually do a quick scan
    // (as suggested in the paper) to optimize this.
    var freq = 20000;
    // var freq = 440;

    // See paper for this particular choice of frequencies
    var relevantFreqWindow = 33;

    var getBandWidth = function(analyser, freqs) {

        var primaryTone = freqToIndex(analyser, freq);
        var primaryVolume = freqs[primaryTone];

        // This ratio is totally empirical (aka trial-and-error).
        var maxVolumeRatio = 0.001;

        var leftBandwidth = 0;
        var rightBandwidth = 0;

        var volume;
        var normalizedVolume;

        do {
          leftBandwidth++;
          volume = freqs[primaryTone - leftBandwidth];
          normalizedVolume = volume / primaryVolume;
        } while (normalizedVolume > maxVolumeRatio && leftBandwidth < relevantFreqWindow);

        do {
          rightBandwidth++;
          volume = freqs[primaryTone + rightBandwidth];
          normalizedVolume = volume / primaryVolume;
        } while (normalizedVolume > maxVolumeRatio && rightBandwidth < relevantFreqWindow);

        return {
            left: leftBandwidth,
            right: rightBandwidth
        };
    };

    var freqToIndex = function(analyser, freq) {
      var nyquist = ctx.sampleRate / 2;
      return round( freq / nyquist * analyser.fftSize/2 );
    };

    var indexToFreq = function(analyser, index) {
      var nyquist = ctx.sampleRate / 2;
      return nyquist / (analyser.fftSize / 2) * index;
    };

    var optimizeFrequency = function(osc, analyser, freqSweepStart, freqSweepEnd) {
        var oldFreq = osc.frequency.value;

        var audioData = new Uint8Array(analyser.frequencyBinCount);
        var maxAmp = 0;
        var maxAmpIndex = 0;

        var from = freqToIndex(analyser, freqSweepStart);
        var to   = freqToIndex(analyser, freqSweepEnd);

        for (var i = from; i < to; i++) {
            osc.frequency.value = indexToFreq(analyser, i);
            analyser.getByteFrequencyData(audioData);

            if (audioData[i] > maxAmp) {
                maxAmp = audioData[i];
                maxAmpIndex = i;
            }
        }

        // Sometimes the above procedure seems to fail, not sure why.
        // If that happends, just use the old value.
        if (maxAmpIndex == 0) {
            return oldFreq;
        } else {
            return indexToFreq(analyser, maxAmpIndex);
        }
    };

    var readMicInterval = 0;

    var readMic = function(analyser, userCallback) {
        var audioData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(audioData);

        var band = getBandWidth(analyser, audioData);
        userCallback(band);

        readMicInterval = setTimeout(readMic, 1, analyser, userCallback);
    };

    var handleMic = function(stream, callback, userCallback) {
        // Mic
        var mic = ctx.createMediaStreamSource(stream);
        var analyser = ctx.createAnalyser();

        analyser.smoothingTimeConstant = 0.5;
        analyser.fftSize = 2048;

        mic.connect(analyser);

        // Doppler tone
        osc.frequency.value = freq;
        osc.type = osc.SINE;
        osc.start(0);
        osc.connect(ctx.destination);

        // There seems to be some initial "warm-up" period
        // where all frequencies are significantly louder.
        // A quick timeout will hopefully decrease that bias effect.
        setTimeout(function() {
            // Optimize doppler tone
            freq = optimizeFrequency(osc, analyser, 19000, 22000);
            osc.frequency.value = freq;

            clearInterval(readMicInterval);
            callback(analyser, userCallback);
        });
    };

    var init = function(callback) {
        navigator.getUserMedia_ = (
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia
        );

        var request = {
            audio: {
                optional: [{ echoCancellation: false }]
            }
        };

        var onSuccess = function(stream) {
            handleMic(stream, readMic, callback);
        };

        var onError = function(error) {
            console.error('Error!', error);
        };

        navigator.getUserMedia_(request, onSuccess, onError);
    };

    var stop = function() {
        clearInterval(readMicInterval);
    };

    return {
      init: init,
      stop: stop
    };
};

module.exports = doppler();
