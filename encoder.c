//
// encoder.c - audio synth experiment for Contact TM demo
// Author: Ted Burke
// Last updated: 30 Aug 2025 (for Dublin Maker 2025)
//
// To compile:
//   gcc encoder.c -o encoder -lm
//
// To run:
//   ./encoder | aplay -f FLOAT_LE -c1 -r44100
//
// Or to store to file:
//   ./encoder > signal.raw
//
// And to convert to mp3:
//   ffmpeg -y -f f32le -ar 44100 -ac 1 -i signal.raw signal.mp3
//
// Alternatively, combine it into one step:
//   ./encoder | ffmpeg -y -f f32le -ar 44100 -ac 1 -i - signal.mp3
//

#include <stdio.h>
#include <stdlib.h>
#include <math.h>

int main()
{
    int hn, sn, N;        // harmonic number, sample number, number of samples in buffer
    int note = 60;        // note number (same values as MIDI note numbers)
    double f[128];        // will be used to store frequency for each note number
    int Fs = 44100;       // sampling freq
    float s;              // used to store one sample
    float *buf;           // pointer to audio buffer
    char plaintext[3600]; // Character buffer for text to be encoded

    // Load text to be encoded
    int count;
    char plaintext_filename[] = "plaintext.txt";
    FILE *plaintext_file = fopen(plaintext_filename, "r");
    count = fread(plaintext,1,3600,plaintext_file);
    fclose(plaintext_file);
    fprintf(stderr, "%d characters read from %s\n", count, plaintext_filename);

    // Calculate frequency for each note number
    for (sn = 0 ; sn < 128 ; ++sn) f[sn] = 440.0 * pow(2, (sn-69.0)/12.0);
    for (sn = 0 ; sn < 128 ; ++sn) fprintf(stderr, "%c%10.3lf", sn%12 ? ' ' : '\n', f[sn]);
    fprintf(stderr, "\n");

    // Allocate buffer to store audio samples
    N = Fs * 3600;     // specify 1-hour buffer (3600 seconds)
    buf = malloc(N * sizeof(s));
    if (!buf) return 1;

    // Generate waveform with several harmonics
    float h[8];
    int upwards = 1;
    for (hn=1 ; hn<=7 ; ++hn) h[hn] = 0.5 + 0.5 * exp(1 - hn);
    for (sn = 0 ; sn < N ; ++sn)
    {
        // Figure out what data bit is being encoded at this sample
        char c = plaintext[sn/Fs]; // which character of the text are we encoding?
        int bit_number, bit_value;
        bit_number = (sn/(Fs/10)) % 10; // which bit in the current character?
        if (bit_number == 0) bit_value = 1;                 // start bit
        else if (bit_number == 9) bit_value = 0;            // stop bit
        else bit_value = c & (1 << (bit_number-1)) ? 1 : 0; // data bit
       
        // Every 200ms, there's a 50% chance that the note might change (by 3 or 5 semitones)
        if ((sn % (Fs/5) == 0) && (rand() % 2)) note += upwards * (rand() % 2 ? 3 : 5); // note = 48 + (rand() % 24);
        if (rand() % 5 == 0) upwards *= -1;
        if (note >= 72) upwards = -1;
        if (note <= 48) upwards = +1;

        h[3] = bit_value ? 0.25 : 1.00;
        h[5] = bit_value ? 1.00 : 0.25;
        s = 0;
        for (hn=1 ; hn<=7 ; ++hn) s += h[hn] * sin(2.0 * M_PI * hn * f[note] * sn / Fs);
        buf[sn] = s / 8.0;
    }

    // Write audio data to stdout
    fwrite(buf, sizeof(s), N, stdout);

    // Clean up and exit
    free(buf);
    return 0;
}

