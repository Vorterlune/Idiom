import { Settings } from '@idiom/ui';

export default function LicencesPage() {
  return (
    <Settings.Screen safeAreaEdges={['left', 'right', 'bottom']} testID="licences-screen">
      <Settings.Section title="Idiom" footer="Copyright © 2026 Vorterlune.">
        <Settings.Value icon="document" label="Project licence" value="MIT" />
        <Settings.Row
          label="Permission to use"
          description={
            'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.'
          }
        />
        <Settings.Row
          label="Warranty"
          description={
            'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.'
          }
        />
      </Settings.Section>
      <Settings.Section
        title="Built with open source"
        footer="Dependency licences are retained in their installed packages. Full attribution and distribution details are in THIRD_PARTY_NOTICES.md."
      >
        <Settings.Value label="React & React Native" value="MIT" />
        <Settings.Value label="Expo & Expo UI" value="MIT" />
        <Settings.Value label="React Native Safe Area Context" value="MIT" />
        <Settings.Value label="Material Symbols" value="Apache-2.0" />
        <Settings.Row
          label="SF Symbols"
          description="Resolved from the operating system on Apple devices. Idiom does not bundle Apple symbol artwork."
        />
      </Settings.Section>
    </Settings.Screen>
  );
}
