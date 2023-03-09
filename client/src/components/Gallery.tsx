import React, { useEffect } from "react";
// @ts-ignore
// import PhotoSwipeLightbox from "photoswipe/dist/photoswipe-lightbox.esm.js";

// import PhotoSwipeLightbox from "photoswipe/lightbox";

import { FaTrash } from "react-icons/fa";
import "photoswipe/style.css";

import { Image } from "../types";

export function Gallery({
    galleryID,
    onDeleteImage,
    images,
}: {
    galleryID: string;
    onDeleteImage?: (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        imageForDelete: Image
    ) => void;
    images: Image[];
}) {
    // useEffect(() => {
    //     let lightbox = new PhotoSwipeLightbox({
    //         gallery: "#" + galleryID,
    //         children: "a",
    //         pswpModule: () => import("photoswipe"),
    //     });
    //     lightbox.init();

    //     return () => {
    //         lightbox.destroy();
    //         lightbox = null;
    //     };
    // }, [galleryID]);

    return (
        <div className="pswp-gallery flex mt-2 gap-2" id={galleryID}>
            {images.map((image, index) => (
                <div key={index} className="relative">
                    <a
                        href={image.largeURL}
                        data-pswp-width={image.width}
                        data-pswp-height={image.height}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <img
                            src={`${image.largeURL.slice(0, 50)}c_scale,h_150/${
                                image.publicId
                            }.jpg`}
                            alt=""
                        />
                    </a>
                    {onDeleteImage && (
                        <button
                            className="absolute top-2 right-2 rounded-full border-4 border-white bg-white text-red-500 hover:text-red-400"
                            onClick={(e) => {
                                onDeleteImage(e, image);
                            }}
                        >
                            <FaTrash size="12" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
