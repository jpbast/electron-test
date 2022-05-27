import React from "react";
import { Wrapper } from "./styles";
import { GoFileDirectory } from "react-icons/go";
import { MdOutlineSubdirectoryArrowRight } from "react-icons/md";

type Folder = { folderName: string; files: string[] };

const App: React.FC = () => {
  const [folderName, setFolderName] = React.useState("");
  const [fileName, setFileName] = React.useState("");
  const [folders, setFolders] = React.useState<Folder[] | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    window.api.on("folders", (folders: Folder[]) => {
      setFolders(folders);
    });

    window.api.on("thumbnailUrl", (url: string) => {
      setThumbnailUrl(url);
    });
  }, []);

  const handleMoveFile = (paths: { src: string; dest: string }) => {
    window.api.send("moveFile", paths);
  };

  const handlePrintscreen = () => {
    window.api.send("capture", null);
  };

  return (
    <Wrapper>
      <label htmlFor="folderInput">
        Folder name
        <input
          name="folderInput"
          onChange={(e) => setFolderName(e.target.value)}
          value={folderName}
          placeholder="Folder name"
        />
        <button onClick={() => window.api.send("createFolder", folderName)}>
          Create folder
        </button>
      </label>
      <label htmlFor="folderInput">
        File name on folder <strong>{folderName}</strong>
        <input
          name="folderInput"
          onChange={(e) => setFileName(e.target.value)}
          value={fileName}
          placeholder="File name"
        />
        <button
          onClick={() =>
            window.api.send("createFile", {
              folderName,
              fileName,
            })
          }
        >
          Create file
        </button>
      </label>
      <div>
        {folders &&
          folders.map((folder) => (
            <ul key={folder.folderName}>
              <GoFileDirectory /> {folder.folderName}
              {folder.files.map((file) => (
                <li key={file}>
                  <MdOutlineSubdirectoryArrowRight /> {file}
                  <select
                    name="move-to-directory"
                    id={file}
                    onChange={(e) =>
                      handleMoveFile({
                        src: `./${folder.folderName}/${file}`,
                        dest: `./${e.target.value}/${file}`,
                      })
                    }
                  >
                    {folders.map((fld) => (
                      <option
                        placeholder="Move to directory"
                        value={fld.folderName}
                      >
                        {fld.folderName}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          ))}
      </div>
      <button onClick={handlePrintscreen}>Printscreen</button>
      {thumbnailUrl && <img src={thumbnailUrl} alt="" />}
    </Wrapper>
  );
};

export default App;
