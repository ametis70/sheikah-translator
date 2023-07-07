import { Tab, Dialog } from "@headlessui/react";
import { useState } from "react";

const sourceType = "Wii U";
const targetType = "Switch";

const titles = ["Select folder", "Convert", "Save"];

function App() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  let [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <header>
        <h1>Sheikah Converter</h1>
        <button onClick={() => setModalOpen(true)}>info</button>
      </header>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <Dialog.Panel>
          <Dialog.Title>Sheikah Converter</Dialog.Title>
          <Dialog.Description>TLoZ: BotW saves converter</Dialog.Description>

          <p>
            In this website you can convert your save files from The Legend of
            Zelda: Breath of the Wild from one console format to another (Switch
            to Wii U or Wii U to Switch). Just upload the save folder and
            convert away!
            <br />
            <br />
            You can check the source code on{" "}
            <a href="https://github.com/ametis70/sheikah-converter">GitHub.</a>
          </p>
          <button onClick={() => setModalOpen(false)}>Close</button>
        </Dialog.Panel>
      </Dialog>
      <main>
        <h2>{titles[selectedTabIndex]}</h2>
        <Tab.Group
          selectedIndex={selectedTabIndex}
          onChange={setSelectedTabIndex}
        >
          <Tab.List>
            <Tab>Select folder</Tab>
            <Tab>Convert</Tab>
            <Tab>Save</Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <div>
                <strong>Select a save folder from disk</strong>
              </div>
              <hr />
              <div>
                Select a folder that contains a save. <br />
                The converter will automatically determine if it’s a save for{" "}
                <span>Wii U</span> or <span>Switch</span> in the next step.
              </div>
            </Tab.Panel>
          </Tab.Panels>
          <Tab.Panel>
            <div>
              <strong>Convert the selected save</strong>
            </div>
            <hr />
            <div>
              The selected save is a <span>{sourceType}</span> save. It will be
              converted to the <span>{targetType}</span> format. <br />
              The original file in your disk won’t be modified.
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div>
              <strong>Save the converted types</strong>
            </div>
            <hr />
            <div>
              Your save is ready to be used on the <span>{targetType}</span>{" "}
              console. <br />
              Copy it to your emulator save folder or use homebrew to restore it
              as a backup on the actual console.
            </div>
          </Tab.Panel>
        </Tab.Group>
      </main>
    </>
  );
}

export default App;
