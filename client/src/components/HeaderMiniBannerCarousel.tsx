import { useMemo, useRef } from 'react';
import { Carousel, theme } from 'antd';
import type { CarouselRef } from 'antd/es/carousel';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import styles from './HeaderMiniBannerCarousel.module.css';

export type HeaderMiniBannerCarouselItem = {
  banner?: string;
  title?: string;
  url?: string;
};

type Props = {
  items?: ReadonlyArray<HeaderMiniBannerCarouselItem>;
  intervalMs?: number;
  className?: string;
};

const DEFAULT_INTERVAL_MS = 5000;

export function HeaderMiniBannerCarousel({ items = [], intervalMs = DEFAULT_INTERVAL_MS, className }: Props) {
  const { token } = theme.useToken();
  const carouselRef = useRef<CarouselRef>(null);
  const visibleItems = useMemo(() => items.filter(item => item.banner || item.title), [items]);
  const hasControls = visibleItems.length > 1;

  if (visibleItems.length === 0) {
    return null;
  }

  const goToPrevItem = () => {
    carouselRef.current?.prev();
  };

  const goToNextItem = () => {
    carouselRef.current?.next();
  };
  const carouselClassName = [styles.carousel, className].filter(Boolean).join(' ');
  const controlStyle = {
    backgroundColor: token.colorFillSecondary,
    borderColor: token.colorBorder,
    color: token.colorText,
  };

  return (
    <div data-testid="carouselContainer" className={carouselClassName}>
      <div className={styles.carouselViewport}>
        <Carousel
          ref={carouselRef}
          className={styles.carouselInner}
          autoplay={hasControls && intervalMs > 0}
          autoplaySpeed={intervalMs}
          dots={false}
          infinite={hasControls}
        >
          {visibleItems.map((item, idx) => {
            const label = item.title ?? 'Header banner';
            const hasBanner = Boolean(item.banner);

            return (
              <div
                key={`${item.url ?? ''}-${item.banner ?? ''}-${item.title ?? label}-${idx}`}
                className={hasBanner ? styles.slideContentBanner : styles.slideContent}
              >
                {hasBanner ? (
                  <>
                    <img src={item.banner} alt={label} className={styles.banner} />
                    {item.url && <a href={item.url} className={styles.bannerLink} title={label} aria-label={label} />}
                  </>
                ) : item.url ? (
                  <a href={item.url} className={styles.slide} title={label}>
                    <span className={styles.title} style={{ color: token.colorText }}>
                      {item.title}
                    </span>
                  </a>
                ) : (
                  <span className={styles.slide} title={label}>
                    <span className={styles.title} style={{ color: token.colorText }}>
                      {item.title}
                    </span>
                  </span>
                )}
              </div>
            );
          })}
        </Carousel>
      </div>
      {hasControls ? (
        <>
          <button
            type="button"
            aria-label="Previous banner"
            className={styles.controlLeft}
            style={controlStyle}
            onClick={goToPrevItem}
          >
            <LeftOutlined />
          </button>
          <button
            type="button"
            aria-label="Next banner"
            className={styles.controlRight}
            style={controlStyle}
            onClick={goToNextItem}
          >
            <RightOutlined />
          </button>
        </>
      ) : null}
    </div>
  );
}
