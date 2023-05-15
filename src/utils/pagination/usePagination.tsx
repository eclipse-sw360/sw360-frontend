// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useMemo } from 'react';

export const DOTS = '...';

const range = (start:number, end:number) => {
  const length = end - start + 1;
  const pageRange = Array.from({ length }, (_, idx) => idx + start);
  return pageRange;
};

export const usePagination = ({
  totalCount,
  pageSize,
  siblingCount = 1,
  currentPage
}:
{
  totalCount:number,
  pageSize:number,
  siblingCount : number,
  currentPage:number
}) => {
  const [paginationRange, dataIndex] = useMemo(() => {

    const totalPageCount = Math.ceil(totalCount / pageSize);

    // Pages count is determined as siblingCount + firstPage + lastPage + currentPage + 2*DOTS
    const totalPageNumbers = siblingCount + 5;

    /*
      If the number of pages is less than the page numbers we want to show in our
      paginationComponent, we return the range [1..totalPageCount]
    */
    if (totalPageNumbers >= totalPageCount) {

      const pageRange = range(1, totalPageCount)
      if (pageRange.length == 1)
      {
        const firstDataIndex = 1;
        const lastDataIndex = totalCount;
        return [pageRange, [firstDataIndex, lastDataIndex]];
      }
      else if (currentPage == totalPageCount)
      {
        const lastDataIndex = totalCount;
        const firstDataIndex = (currentPage -1) * pageSize + 1;
        return [pageRange, [firstDataIndex, lastDataIndex]];
      }
      else
      {
        const lastDataIndex = currentPage * pageSize;
        const firstDataIndex = (lastDataIndex - pageSize) + 1;
        return [pageRange, [firstDataIndex, lastDataIndex]];
      }
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPageCount
    );

    /*
      We do not want to show dots if there is only one position left
      after/before the left/right page count as that would lead to a change if our Pagination
      component size which we do not want
    */
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    let lastDataIndex = 0;
    let firstDataIndex = 0;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + (2 * siblingCount);
      const leftRange = range(1, leftItemCount);
      lastDataIndex = currentPage * pageSize;
      firstDataIndex = (lastDataIndex - pageSize) + 1;
      return [[...leftRange, DOTS, totalPageCount], [firstDataIndex, lastDataIndex]];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(
        totalPageCount - rightItemCount + 1,
        totalPageCount
      );
      if (currentPage === totalPageCount){
        lastDataIndex = totalCount;
        firstDataIndex =  (currentPage -1) * pageSize + 1;
      }
      else{
        lastDataIndex = currentPage * pageSize;
        firstDataIndex = (lastDataIndex - pageSize) + 1;
      }
      return [[firstPageIndex, DOTS, ...rightRange],  [firstDataIndex, lastDataIndex]];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      lastDataIndex = middleRange[1]*pageSize;
      firstDataIndex =  ((middleRange[1] - 1) * pageSize) + 1;
      return [[firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex],  [firstDataIndex, lastDataIndex]];
    }
  }, [totalCount, pageSize, siblingCount, currentPage]) || [[],[]];

  return [paginationRange, dataIndex];
};
