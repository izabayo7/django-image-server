import { ChangeEvent, useEffect, useState } from "react";
import FilerobotImageEditor, {
  TABS,
  TOOLS,
} from "react-filerobot-image-editor";

import "./App.css";

function App() {
  const [isImgEditorShown, setIsImgEditorShown] = useState(false);

  const [saveToServer, setSaveToServer] = useState(true);

  const [activeImage, setActiveImage] = useState<Image>();

  const [images, setImages] = useState<Image[]>([]);

  type Image = {
    id: string;
    name: string;
    url?: string;
  };

  type TAB =
    | "Finetune"
    | "Filters"
    | "Adjust"
    | "Watermark"
    | "Annotate"
    | "Resize";

  const [selectedTabs, setSelectedTabs] = useState<TAB[]>([
    TABS.ADJUST,
    TABS.FINETUNE,
    TABS.FILTERS,
    TABS.WATERMARK,
    TABS.ANNOTATE,
    TABS.RESIZE,
  ]);

  const IMG_EDITOR_TABS: { [key: string]: TAB } = {
    adjust: TABS.ADJUST,
    finetune: TABS.FINETUNE,
    filter: TABS.FILTERS,
    watermark: TABS.WATERMARK,
    annotate: TABS.ANNOTATE,
    resize: TABS.RESIZE,
  };

  const onChangeTabsHandler = (event: ChangeEvent) => {
    const target = event.target as HTMLInputElement;
    const { value, checked } = target;
    const nextTab = IMG_EDITOR_TABS[value];

    if (checked) {
      if (!selectedTabs.includes(nextTab)) {
        setSelectedTabs([...selectedTabs, nextTab]);
      }
    } else {
      const removedTabIndex = selectedTabs.indexOf(nextTab);

      if (selectedTabs.includes(nextTab) && selectedTabs.length === 1) {
        target.checked = true;
        return;
      }

      setSelectedTabs(
        selectedTabs.filter((_, index) => index !== removedTabIndex)
      );
    }
  };

  const onSave = (url: string, fileName: string | null) => {
    if (saveToServer) {
      // Create a Blob from the base64 image data
      const blob = b64toBlob(url);

      // Create a File from the Blob
      const file = new File([blob], fileName || "image.png", {
        type: "image/png",
      });

      uploadImg(file, activeImage?.id);
    } else {
      let tmpLink: HTMLAnchorElement | null = document.createElement("a");
      tmpLink.href = url;

      tmpLink.download = fileName || "image.png";

      tmpLink.style.cssText =
        "position: absolute; z-index: -111; visibility: none;";
      document.body.appendChild(tmpLink);
      tmpLink.click();
      document.body.removeChild(tmpLink);
      tmpLink = null;
    }
  };

  const uploadImg = (file: File, id?: string) => {
    const formData = new FormData();
    formData.append("image", file);

    fetch(`http://localhost:8000/gallery/upload/${id ? "?update=" + id : ""}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        const image = {
          id: data.id,
          name: data.name,
          url: `http://localhost:8000/gallery/${data.id}/?${Date.now()}`,
        };
        setImages([image, ...images.filter((img) => img.id !== id)]);
      });
  };

  // Helper function to convert base64 to Blob
  function b64toBlob(base64: string) {
    if (base64.startsWith("data:image/png;base64,")) {
      // Remove the prefix and return the remaining base64 data
      base64 = base64.slice("data:image/png;base64,".length);
    }

    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    return new Blob([byteArray], { type: "image/png" });
  }

  const fetchImages = async () => {
    const response = await fetch("http://localhost:8000/gallery/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data: Image[] = await response.json();

    setImages(
      data.map((image) => ({
        id: image.id,
        name: image.name,
        url: `http://localhost:8000/gallery/${image.id}/`,
      }))
    );
  };

  const deleteImage = async (id: string) => {
    const response = await fetch(`http://localhost:8000/gallery/${id}/delete/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: { success: boolean } = await response.json();

    if (data.success) setImages(images.filter((image) => image.id !== id));
  };

  useEffect(() => {
    if (!activeImage) return;

    setIsImgEditorShown(false);
    setTimeout(() => {
      setIsImgEditorShown(true);
    }, 300);
  }, [activeImage]);

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    setIsImgEditorShown(false);
    if (images.length > 0) {
      setActiveImage(images[0]);
    }
  }, [images]);

  return (
    <>
      <section className="content-wrapper">
        <div className="content">
          <div className="img-table container">
            <div id="config-wrapper" className="config-table">
              <h4>Images</h4>
              <div className="img-container">
                <div className="uploaded-imgs-wrapper">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className={`uploaded-img ${
                        activeImage?.url === image.url && "active"
                      }`}
                      style={{ backgroundImage: `url(${image.url})` }}
                      onClick={() => {
                        setActiveImage(image);
                      }}
                      title={image.name}
                    >
                      <div
                        className="delete-icon"
                        title="Delete image"
                        onClick={() => {
                          deleteImage(image.id);
                        }}
                        id="deleteIcon"
                      ></div>
                    </div>
                  ))}
                </div>
                <input
                  onChange={(e) => {
                    if (!e.target.files) return;
                    uploadImg(e.target.files[0]);
                  }}
                  className="add-img"
                  type="file"
                  accept="image/*"
                  name="image"
                  id="add-image"
                />
              </div>
              <h5>Tabs</h5>
              <div className="tools-checkboxs">
                <div>
                  <label className="checkbox-container" htmlFor="crop">
                    Adjust
                    <input
                      id="crop"
                      value="adjust"
                      type="checkbox"
                      name="Crop"
                      onChange={onChangeTabsHandler}
                      checked={selectedTabs.includes(TABS.ADJUST)}
                    />
                    <span className="checkmark"></span>
                  </label>
                  <br />
                </div>
                <div>
                  <label className="checkbox-container" htmlFor="finetune">
                    Finetune
                    <input
                      id="finetune"
                      value="finetune"
                      type="checkbox"
                      name="Finetune"
                      onChange={onChangeTabsHandler}
                      checked={selectedTabs.includes(TABS.FINETUNE)}
                    />
                    <span className="checkmark"></span>
                  </label>
                  <br />
                </div>
                <div id="filter-wrapper">
                  <label
                    id="filter-label"
                    className="checkbox-container"
                    htmlFor="filter"
                  >
                    Filters
                    <input
                      id="filter"
                      value="filter"
                      type="checkbox"
                      name="Filters"
                      onChange={onChangeTabsHandler}
                      checked={selectedTabs.includes(TABS.FILTERS)}
                    />
                    <span className="checkmark"></span>
                  </label>
                  <br />
                </div>
                <div>
                  <label className="checkbox-container" htmlFor="watermark">
                    Watermark
                    <input
                      id="watermark"
                      value="watermark"
                      type="checkbox"
                      name="Watermark"
                      onChange={onChangeTabsHandler}
                      checked={selectedTabs.includes(TABS.WATERMARK)}
                    />
                    <span className="checkmark"></span>
                  </label>
                  <br />
                </div>
                <div id="annotate-wrapper">
                  <label
                    id="annotate-label"
                    className="checkbox-container"
                    htmlFor="annotate"
                  >
                    Draw
                    <input
                      id="annotate"
                      value="annotate"
                      type="checkbox"
                      name="Annotate"
                      onChange={onChangeTabsHandler}
                      checked={selectedTabs.includes(TABS.ANNOTATE)}
                    />
                    <span className="checkmark"></span>
                  </label>
                  <br />
                </div>
                <div>
                  <label className="checkbox-container" htmlFor="resize">
                    Resize
                    <input
                      id="resize"
                      value="resize"
                      type="checkbox"
                      name="Resize"
                      onChange={onChangeTabsHandler}
                      checked={selectedTabs.includes(TABS.RESIZE)}
                    />
                    <span className="checkmark"></span>
                  </label>
                  <br />
                </div>
                <div className="mode-content">
                  <h4>Mode</h4>
                  <select
                    onChange={(e) => {
                      setSaveToServer(e.target.value === "Cloudimage");
                    }}
                    id="mode-options"
                  >
                    <option className="mode-options" value="Cloudimage">
                      Save on server
                    </option>
                    <option className="mode-options" value="Download">
                      Download
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div className="editor-container" id="editor_container">
              {/* <button onClick={openImgEditor}>Open Filerobot image editor</button> */}
              {isImgEditorShown ? (
                <FilerobotImageEditor
                  source={activeImage?.url || ""}
                  onSave={(editedImageObject) =>
                    onSave(
                      editedImageObject.imageBase64 || "",
                      editedImageObject.fullName || null
                    )
                  }
                  annotationsCommon={{
                    fill: "#ff0000",
                  }}
                  Text={{ text: "Filerobot..." }}
                  Rotate={{ angle: 90, componentType: "slider" }}
                  Crop={{
                    presetsItems: [
                      {
                        titleKey: "classicTv",
                        descriptionKey: "4:3",
                        ratio: 4 / 3,
                        // icon: CropClassicTv, // optional, CropClassicTv is a React Function component. Possible (React Function component, string or HTML Element)
                      },
                      {
                        titleKey: "cinemascope",
                        descriptionKey: "21:9",
                        ratio: 21 / 9,
                        // icon: CropCinemaScope, // optional, CropCinemaScope is a React Function component.  Possible (React Function component, string or HTML Element)
                      },
                    ],
                    presetsFolders: [
                      {
                        titleKey: "socialMedia",

                        // icon: Social, // optional, Social is a React Function component. Possible (React Function component, string or HTML Element)
                        groups: [
                          {
                            titleKey: "facebook",
                            items: [
                              {
                                titleKey: "profile",
                                width: 180,
                                height: 180,
                                descriptionKey: "fbProfileSize",
                              },
                              {
                                titleKey: "coverPhoto",
                                width: 820,
                                height: 312,
                                descriptionKey: "fbCoverPhotoSize",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  }}
                  tabsIds={[...selectedTabs]} // or {['Adjust', 'Annotate', 'Watermark']}
                  defaultTabId={TABS.ANNOTATE} // or 'Annotate'
                  defaultToolId={TOOLS.TEXT} // or 'Text'
                  savingPixelRatio={0}
                  previewPixelRatio={0}
                />
              ) : (
                images.length ? <div className="plugin-spinner"></div> : <div className="no-images">No images found, upload one!</div>
              )}
            </div>
          </div>
          <div className="blue-blur-ellipse"></div>
          <div className="cyan-blur-ellipse"></div>
        </div>
      </section>
      <div></div>
    </>
  );
}

export default App;
