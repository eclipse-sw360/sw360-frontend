// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react';
import classnames from 'classnames';
import { usePagination, DOTS } from './usePagination';
import paginationStyle from './pagination.module.css';

const Pagination = (props: any) => {
  const {
    onPageChange,
    totalCount,
    siblingCount = 1,
    currentPage,
    pageSize,
    className
  } = props;

  const [paginationRange, dataIndex] = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize
  });

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  const prevButtonClassName = (currentPage: number) => classnames(
    {
      [paginationStyle.paginationItem]: true,
      // eslint-disable-next-line no-constant-condition
      [paginationStyle.disabled]: true ? currentPage === 1 : false,
    }
  );

  const nextButtonClassName = (currentPage: number | string, lastPage: number | string) => classnames(
    {
      [paginationStyle.paginationItem]: true,
      // eslint-disable-next-line no-constant-condition
      [paginationStyle.disabled]: true ? currentPage === lastPage : false,
    }
  );

  const selectedButtonClassName = (pageNumber: number | string, currentPage: number | string) => classnames(
    {
      [paginationStyle.paginationItem]: true,
      // eslint-disable-next-line no-constant-condition
      [paginationStyle.selected]: (true ? pageNumber === currentPage : false),
    }
  );

  const paginationRootContainerClassName = (className: number) => classnames(
    {
      [paginationStyle.paginationContainer]: true,
      [className]: className
    }
  );

  const lastPage = paginationRange[paginationRange.length - 1];
  return (
    <ul
      className={paginationRootContainerClassName(className)}
    >
      <p className={`${paginationStyle.paragraph}`}>
        Showing {dataIndex[0]} to {dataIndex[1]} of {totalCount} Entries
      </p>
      {/* <div className= {`${paginationStyle.pagination}`}> */}
      <li
        className={prevButtonClassName(currentPage)}
        onClick={onPrevious}
      >
        <div>
          Prev. </div>
      </li>
      {paginationRange.map(pageNumber => {
        if (pageNumber === DOTS) {
          return <li className={`${paginationStyle.paginationItem} dots`} key="">&#8230;</li>;
        }

        return (
          <li
            className={selectedButtonClassName(pageNumber, currentPage)}
            key=""
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </li>
        );
      })}
      <li
        className={nextButtonClassName(currentPage, lastPage)}
        onClick={onNext}
      >
        <div >
          Next </div>
      </li>
      {/* </div> */}
    </ul>
  );
};

export default Pagination;
