//
// synth.c - audio synth experiment
// Author: Ted Burke
// Last updated: 29 Aug 2025
//
// To compile:
//   gcc synth.c -o synth -lm
//
// To run:
//   ./synth | aplay -f S16_LE -c1 -r44100
//   ./synth | aplay -f FLOAT_LE -c1 -r44100
//

#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <math.h>
#include <unistd.h>

int main()
{
    int hn, sn, N;     // harmonic number, sample number, number of samples in buffer
    int note;          // note number (same values as MIDI note numbers)
    double f[128];     // will be used to store frequency for each note number
    int Fs = 44100;    // sampling freq
    float s;           // used to store one sample
    float *buf;        // pointer to audio buffer

    // Calculate frequency for each note number
    for (sn = 0 ; sn < 128 ; ++sn) f[sn] = 440.0 * pow(2, (sn-69.0)/12.0);
    for (sn = 0 ; sn < 128 ; ++sn) fprintf(stderr, "%c%10.3lf", sn%12 ? ' ' : '\n', f[sn]);

    // Allocate buffer to store audio samples
    N = Fs * 5;     // specify 5-second buffer
    buf = malloc(N * sizeof(s));
    if (!buf) return 1;

    // Generate waveform with several harmonics
    float h[8];
    for (hn=0 ; hn<=7 ; ++hn) h[hn] = 1.0;
    for (sn = 0 ; sn < N ; ++sn)
    {
        if (sn % (Fs/4) == 0) note = 48 + (rand() % 24);
        h[3] = ((sn/4410)%2) ? 0.25 : 1.00;
        h[5] = ((sn/4410)%2) ? 1.00 : 0.25;
        s = 0;
        for (hn=0 ; hn<=7 ; ++hn) s += h[hn] * sin(2.0 * M_PI * hn * f[note] * sn / Fs);
        buf[sn] = s;
    }

    // Write audio data to stdout
    fwrite(buf, sizeof(s), N, stdout);

    // Clean up and exit
    free(buf);
    return 0;
}

